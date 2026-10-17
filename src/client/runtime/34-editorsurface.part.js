		//#region lib/types/client/editor/EditorSurface.js
		/**
		* Center-column editor: tabs + Monaco/textarea + markdown preview.
		*/
		const appearanceStore = new EditorAppearanceStore();
		/**
		* Editor options imported from the local VSCode settings, or null when none.
		* Re-applied whenever an editor is created: a fresh editor would otherwise
		* revert to the hard-coded defaults and silently drop the import.
		*/
		let importedEditorOptions = null;
		/**
		* Multi-tab editor surface bound to explorer RPC + local stores.
		*/
		function EditorSurface(props) {
			const { ctx, api, tabs, buffers, mdModes, external } = props;
			const t = useExplorerT(ctx);
			const tabState = (0, react.useSyncExternalStore)(tabs.subscribe, tabs.getSnapshot);
			// Subscribe to the whole buffer entry, not just its `content`: `markStale`
			// flips a flag without touching the text, and a content-only snapshot
			// would let React skip the very re-render that shows the warning.
			(0, react.useSyncExternalStore)(buffers.subscribe, () => buffers.get(tabState.activePath ?? ""));
			(0, react.useSyncExternalStore)(mdModes.subscribe, () => tabState.activePath === null ? "source" : mdModes.get(tabState.activePath));
			const appearance = (0, react.useSyncExternalStore)(appearanceStore.subscribe, appearanceStore.getSnapshot);
			const [error, setError] = (0, react.useState)(null);
			const [status, setStatus] = (0, react.useState)("");
			const [cursorPos, setCursorPos] = (0, react.useState)({
				line: 1,
				column: 1
			});
			const [monacoReady, setMonacoReady] = (0, react.useState)(false);
			const [monacoFailed, setMonacoFailed] = (0, react.useState)(false);
			const [appearanceOpen, setAppearanceOpen] = (0, react.useState)(false);
			const [vscodeThemeName, setVscodeThemeName] = (0, react.useState)(null);
			const hostRef = (0, react.useRef)(null);
			const editorRef = (0, react.useRef)(null);
			const applyingExternal = (0, react.useRef)(false);
			const activePath = tabState.activePath;
			const buffer = activePath === null ? void 0 : buffers.get(activePath);
			const mdMode = activePath !== null && isMarkdownPath(activePath) ? mdModes.get(activePath) : "source";
			(0, react.useLayoutEffect)(() => {
				appearanceStore.hydrate();
			}, []);
			/**
			* Adopt the local VSCode profile (theme + explicitly configured editor
			* options) so the editor matches what the user already uses to write code.
			*
			* Best-effort and strictly additive: `found: false` (no VSCode installed) is
			* a normal outcome, a failed parse is ignored, and a theme the user picked in
			* this editor is never overridden.
			*/
			(0, react.useEffect)(() => {
				let cancelled = false;
				api.vscodeProfile().then((result) => {
					if (cancelled || !result.ok) return;
					const payload = result.value;
					if (!payload.found || payload.profile === "") return;
					let parsed;
					try {
						parsed = JSON.parse(payload.profile);
					} catch {
						return;
					}
					if (cancelled || parsed === null || typeof parsed !== "object") return;
					const theme = parsed.theme ?? null;
					if (theme !== null) {
						vscodeThemeDefinition = theme;
						setVscodeThemeName(typeof theme.name === "string" && theme.name !== "" ? theme.name : payload.source);
					}
					const options = parsed.editorOptions ?? null;
					if (options !== null && typeof options === "object") {
						importedEditorOptions = options;
						const editor = editorRef.current;
						if (editor !== null) {
							try {
								editor.updateOptions(options);
							} catch {
								/* ignore option keys this Monaco build rejects */
							}
						}
					}
					if (theme === null || appearanceStore.hasThemeChoice()) return;
					appearanceStore.adoptTheme(VSCODE_THEME_ID);
				}).catch(() => {
					/* the local profile is an optional enhancement */
				});
				return () => {
					cancelled = true;
				};
			}, [api]);
			const openPath = (0, react.useCallback)(async (path) => {
				tabs.open(path);
				if (buffers.get(path) !== void 0) return;
				const result = await api.read(path);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					tabs.close(path);
					return;
				}
				setError(null);
				buffers.load(path, result.value.content, result.value.mtimeMs);
			}, [
				api,
				buffers,
				tabs
			]);
			(0, react.useEffect)(() => {
				const handler = (event) => {
					const detail = event.detail;
					if (detail?.path) openPath(detail.path);
				};
				window.addEventListener("file-explorer:open", handler);
				return () => window.removeEventListener("file-explorer:open", handler);
			}, [openPath]);
			const saveActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const entry = buffers.get(activePath);
				if (entry === void 0) return;
				// Optimistic concurrency: hand the host the revision this buffer was
				// read from. If the agent (or anything else) rewrote the file since,
				// the host refuses instead of letting this save win silently.
				const expected = typeof entry.mtimeMs === "number" ? entry.mtimeMs : -1;
				const result = await api.write(activePath, entry.content, expected);
				if (!result.ok) {
					if (result.error.code === "CONFLICT") {
						buffers.markStale(activePath);
						setError(t("editorConflict"));
						return;
					}
					setError(describeRpcError(result.error, t));
					return;
				}
				buffers.markSaved(activePath, result.value.mtimeMs);
				setError(null);
				setStatus(t("editorSaved"));
				window.setTimeout(() => setStatus(""), 1200);
			}, [
				activePath,
				api,
				buffers,
				t
			]);
			/** Replace the buffer with the current disk revision (explicit user intent). */
			const reloadActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const result = await api.read(activePath);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				buffers.load(activePath, result.value.content, result.value.mtimeMs);
				setError(null);
			}, [
				activePath,
				api,
				buffers
			]);
			/**
			* Overwrite the disk revision on purpose.
			*
			* Without this the conflict guard would be a dead end: a dirty buffer whose
			* file moved on could never be saved at all. `-1` explicitly opts out of
			* the revision check.
			*/
			const forceSaveActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const entry = buffers.get(activePath);
				if (entry === void 0) return;
				const result = await api.write(activePath, entry.content, -1);
				if (!result.ok) {
					setError(result.error.message);
					return;
				}
				buffers.markSaved(activePath, result.value.mtimeMs);
				setError(null);
				setStatus(t("editorSaved"));
				window.setTimeout(() => setStatus(""), 1200);
			}, [
				activePath,
				api,
				buffers,
				t
			]);
			/**
			* Reconcile open buffers with the host's change feed.
			*
			* A clean buffer is silently reverted to the disk revision — that is what
			* it should look like when something else rewrites a file you are merely
			* looking at. A buffer with unsaved edits is never touched: it is flagged
			* so the user can choose between reloading and saving over.
			*/
			(0, react.useEffect)(() => {
				if (external === null) return;
				const open = tabs.getSnapshot().open;
				if (open.length === 0) return;
				let cancelled = false;
				const run = async () => {
					for (const tab of open) {
						if (cancelled) return;
						if (!external.paths.has(tab.path)) continue;
						if (buffers.get(tab.path) === void 0) continue;
						if (buffers.isDirty(tab.path)) {
							buffers.markStale(tab.path);
							continue;
						}
						const result = await api.read(tab.path);
						if (cancelled || !result.ok) continue;
						buffers.load(tab.path, result.value.content, result.value.mtimeMs);
					}
				};
				void run();
				return () => {
					cancelled = true;
				};
			}, [
				external,
				api,
				buffers,
				tabs
			]);
			const activeStale = buffer !== void 0 && buffer.stale === true;
			const canFormat = monacoReady && !monacoFailed && activePath !== null && FORMATTABLE_LANGUAGES.has(languageForPath(activePath));
			const formatActive = (0, react.useCallback)(async () => {
				const editor = editorRef.current;
				if (editor === null) return;
				const action = editor.getAction("editor.action.formatDocument");
				if (action === void 0) {
					setStatus(t("editorFormatUnavailable"));
					window.setTimeout(() => setStatus(""), 1600);
					return;
				}
				try {
					await action.run();
					setStatus(t("editorFormatted"));
				} catch {
					setStatus(t("editorFormatUnavailable"));
				}
				window.setTimeout(() => setStatus(""), 1600);
			}, [t]);
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
						event.preventDefault();
						saveActive();
						return;
					}
					if (canFormat && event.altKey && event.shiftKey && event.key.toLowerCase() === "f") {
						event.preventDefault();
						void formatActive();
					}
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [
				saveActive,
				formatActive,
				canFormat
			]);
			(0, react.useEffect)(() => {
				let cancelled = false;
				let attempt = 0;
				const LOAD_ATTEMPTS = 3;
				const RETRY_DELAY_MS = 4e3;
				/**
				* Monaco is fetched from a CDN, so a slow or flaky link can blow the load
				* budget. Retrying matters because the timeout path rejects the promise
				* while the underlying fetch may still land — a retry then resolves straight
				* off the already-populated `window.monaco`, instead of leaving the editor
				* stuck in plain-textarea mode for the rest of the session (observed
				* happening before this was added).
				*/
				const attemptLoad = () => {
					loadMonaco().then(() => {
						if (!cancelled) setMonacoReady(true);
					}).catch(() => {
						if (cancelled) return;
						attempt += 1;
						if (attempt < LOAD_ATTEMPTS) window.setTimeout(attemptLoad, RETRY_DELAY_MS);
						else setMonacoFailed(true);
					});
				};
				attemptLoad();
				return () => {
					cancelled = true;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!monacoReady || monacoFailed || hostRef.current === null || activePath === null) {
					editorRef.current?.dispose();
					editorRef.current = null;
					return;
				}
				if (mdMode === "preview") {
					editorRef.current?.dispose();
					editorRef.current = null;
					return;
				}
				let disposed = false;
				let createdModel = null;
				const snap = appearanceStore.getSnapshot();
				loadMonaco().then((monaco) => {
					if (disposed || hostRef.current === null) return;
					editorRef.current?.dispose();
					editorRef.current = null;
					const content = buffers.get(activePath)?.content ?? "";
					applyMonacoAppearance(monaco, snap);
					createdModel = monaco.editor.createModel(content, languageForPath(activePath), modelUriFor(monaco, activePath));
					const editor = monaco.editor.create(hostRef.current, {
						model: createdModel,
						automaticLayout: true,
						minimap: {
							enabled: snap.minimap === true,
							renderCharacters: false
						},
						fontSize: snap.fontSize,
						theme: snap.customBackground === null ? snap.theme : EDITOR_CUSTOM_THEME_ID,
						scrollBeyondLastLine: false,
						folding: true,
						foldingStrategy: "auto",
						foldingHighlight: true,
						showFoldingControls: "mouseover",
						bracketPairColorization: {
							enabled: true,
							independentColorPoolPerBracketType: true
						},
						guides: {
							bracketPairs: true,
							indentation: true,
							highlightActiveIndentation: true
						},
						matchBrackets: "always",
						linkedEditing: true,
						autoClosingBrackets: "languageDefined",
						autoClosingQuotes: "languageDefined",
						autoClosingTags: true,
						autoSurround: "languageDefined",
						formatOnPaste: true,
						snippetSuggestions: "top",
						quickSuggestions: {
							other: true,
							comments: false,
							strings: true
						},
						wordBasedSuggestions: "currentDocument",
						suggest: {
							preview: true,
							showWords: true
						},
						parameterHints: {
							enabled: true,
							cycle: true
						},
						hover: {
							enabled: true,
							delay: 180
						},
						links: true,
						colorDecorators: true,
						codeLens: true,
						stickyScroll: {
							enabled: true,
							maxLineCount: 5
						},
						renderWhitespace: "selection",
						renderControlCharacters: true,
						renderLineHighlight: "all",
						occurrencesHighlight: "singleFile",
						selectionHighlight: true,
						unicodeHighlight: {
							ambiguousCharacters: false,
							invisibleCharacters: true,
							nonBasicASCII: false
						},
						scrollbar: {
							verticalScrollbarSize: 10,
							horizontalScrollbarSize: 10,
							useShadows: false
						},
						smoothScrolling: true,
						detectIndentation: true,
						tabSize: 2,
						padding: {
							top: 8,
							bottom: 8
						}
					});
					if (importedEditorOptions !== null) {
						try {
							editor.updateOptions(importedEditorOptions);
						} catch {
							/* ignore option keys this Monaco build rejects */
						}
					}
					editorRef.current = editor;
					const initialPosition = editor.getPosition();
					if (initialPosition !== null) setCursorPos({
						line: initialPosition.lineNumber,
						column: initialPosition.column
					});
					editor.onDidChangeCursorPosition((event) => {
						setCursorPos({
							line: event.position.lineNumber,
							column: event.position.column
						});
					});
					editor.onDidChangeModelContent(() => {
						if (applyingExternal.current) return;
						buffers.setContent(activePath, editor.getValue());
					});
				});
				return () => {
					disposed = true;
					editorRef.current?.dispose();
					editorRef.current = null;
					if (createdModel !== null) {
						createdModel.dispose();
						createdModel = null;
					}
				};
			}, [
				monacoReady,
				monacoFailed,
				activePath,
				mdMode,
				buffers
			]);
			(0, react.useEffect)(() => {
				if (!monacoReady || monacoFailed) return;
				loadMonaco().then((monaco) => {
					applyMonacoAppearance(monaco, appearance);
					editorRef.current?.updateOptions({
						fontSize: appearance.fontSize,
						minimap: {
							enabled: appearance.minimap === true,
							renderCharacters: false
						}
					});
				});
			}, [
				appearance.theme,
				appearance.customBackground,
				appearance.fontSize,
				appearance.minimap,
				monacoReady,
				monacoFailed
			]);
			(0, react.useEffect)(() => {
				if (activePath === null || editorRef.current === null) return;
				const next = buffers.get(activePath)?.content ?? "";
				if (editorRef.current.getValue() === next) return;
				applyingExternal.current = true;
				try {
					editorRef.current.setValue(next);
				} finally {
					applyingExternal.current = false;
				}
			}, [
				activePath,
				buffer?.content,
				buffers
			]);
			const dropTab = (0, react.useCallback)((path) => {
				tabs.close(path);
				buffers.drop(path);
				mdModes.drop(path);
			}, [
				buffers,
				mdModes,
				tabs
			]);
			const onClose = (0, react.useCallback)((path) => {
				if (buffers.isDirty(path)) {
					if (!window.confirm(t("confirmCloseDirty"))) return;
				}
				dropTab(path);
			}, [
				buffers,
				dropTab,
				t
			]);
			const onClosePaths = (0, react.useCallback)((paths) => {
				if (paths.length === 0) return;
				if (paths.some((path) => buffers.isDirty(path)) && !window.confirm(t("confirmCloseDirty"))) return;
				for (const path of paths) dropTab(path);
			}, [
				buffers,
				dropTab,
				t
			]);
			(0, react.useEffect)(() => {
				const onEditorKey = (event) => {
					if (!(event.target instanceof Element) || !event.target.closest('[data-file-explorer-editor]')) return;
					if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "w" && activePath !== null) {
						event.preventDefault();
						onClose(activePath);
					}
				};
				window.addEventListener("keydown", onEditorKey);
				return () => window.removeEventListener("keydown", onEditorKey);
			}, [activePath, onClose]);
			if (tabState.open.length === 0 || activePath === null) return (0, react_jsx_runtime.jsx)("div", {
				className: editor_module_css_default.surface,
				"data-file-explorer-editor": "",
				children: (0, react_jsx_runtime.jsx)("div", {
					className: editor_module_css_default.empty,
					children: t("editorEmpty")
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: editor_module_css_default.surface,
				"data-file-explorer-editor": "",
				children: [
					(0, react_jsx_runtime.jsx)(TabStrip, {
						tabs: tabState.open,
						activePath,
						buffers,
						t,
						onActivate: (path) => tabs.activate(path),
						onClose,
						onClosePaths
					}),
					error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.errorBanner,
						children: error
					}) : null,
					activeStale ? (0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.errorBanner,
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "8px"
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							children: t("editorStaleBanner")
						}), (0, react_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								gap: "6px",
								flexShrink: 0
							},
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void reloadActive(),
								children: t("editorReload")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void forceSaveActive(),
								children: t("editorForceSave")
							})]
						})]
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.toolbar,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void saveActive(),
								children: t("editorSave")
							}),
							canFormat ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								title: `${t("editorFormat")} (Shift+Alt+F)`,
								onClick: () => void formatActive(),
								children: t("editorFormat")
							}) : null,
							isMarkdownPath(activePath) ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: mdMode === "source" ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
								onClick: () => mdModes.set(activePath, "source"),
								children: t("editorSource")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: mdMode === "preview" ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
								onClick: () => mdModes.set(activePath, "preview"),
								children: t("editorPreview")
							})] }) : null,
							(0, react_jsx_runtime.jsx)("span", {
								className: editor_module_css_default.status,
								children: status || (monacoFailed ? t("editorTextareaMode") : "")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: editor_module_css_default.toolbarEnd,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: appearanceOpen ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
									"aria-expanded": appearanceOpen,
									"aria-haspopup": "dialog",
									onClick: () => setAppearanceOpen((open) => !open),
									children: t("editorAppearance")
								}), appearanceOpen ? (0, react_jsx_runtime.jsx)(AppearanceMenu, {
									t,
									appearance,
									store: appearanceStore,
									hasImportedTheme: vscodeThemeName !== null,
									onClose: () => setAppearanceOpen(false)
								}) : null]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.pathBar,
						title: activePath,
						"aria-label": t("editorFilePath"),
						"data-editor-breadcrumb": "",
						children: activePath.replaceAll("\\", "/").split("/").filter(Boolean).map((part, index, parts) => (0, react_jsx_runtime.jsxs)("span", {
							className: index === parts.length - 1 ? "vscodeCrumbFile" : "vscodeCrumbFolder",
							children: [index > 0 ? (0, react_jsx_runtime.jsx)("span", { className: "crumbSep", children: "›" }) : null, index === parts.length - 1 ? (0, react_jsx_runtime.jsx)(FileIcon, { name: part }) : null, part]
						}, `${index}:${part}`))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.body,
						children: mdMode === "preview" ? (0, react_jsx_runtime.jsx)(MarkdownPreview, { content: buffer?.content ?? "" }) : monacoReady && !monacoFailed ? (0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.monacoHost,
							ref: hostRef
						}) : (0, react_jsx_runtime.jsx)("textarea", {
							className: editor_module_css_default.textarea,
							style: {
								fontSize: appearance.fontSize,
								...appearance.customBackground !== null ? { background: appearance.customBackground } : {}
							},
							value: buffer?.content ?? "",
							onChange: (event) => buffers.setContent(activePath, event.target.value),
							spellCheck: false
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "editorStatusBar",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: "DSH"
						}), buffer !== void 0 && buffer.content !== buffer.savedContent ? (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem statusDirty",
							children: "● 未保存"
						}) : null, (0, react_jsx_runtime.jsxs)("span", {
							className: "statusItem",
							style: { marginLeft: "auto" },
							children: ["Ln ", cursorPos.line, ", Col ", cursorPos.column]
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: "UTF-8"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: languageForPath(activePath)
						})]
					})
				]
			});
		}
		/** Dispatch a cross-component open request. */
		function requestOpenPath(path) {
			window.dispatchEvent(new CustomEvent("file-explorer:open", { detail: { path } }));
		}
		//#endregion
