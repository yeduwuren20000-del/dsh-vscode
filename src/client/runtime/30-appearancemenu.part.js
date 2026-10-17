		//#region lib/types/client/editor/AppearanceMenu.js
		/**
		* Popover for Monaco theme + custom hex background + font size + saved schemes.
		*/
		const THEME_OPTIONS = [
			{
				id: "vs-dark",
				labelKey: "editorThemeDark"
			},
			{
				id: "vs",
				labelKey: "editorThemeLight"
			},
			{
				id: "hc-black",
				labelKey: "editorThemeHighContrast"
			}
		];
		/**
		* Floating panel: preset themes, custom HTML hex, font size, saved schemes.
		*/
		function AppearanceMenu(props) {
			const { t, appearance, store, onClose, hasImportedTheme } = props;
			const rootRef = (0, react.useRef)(null);
			const [hexDraft, setHexDraft] = (0, react.useState)(appearance.customBackground ?? hexForColorInput(null, appearance.theme));
			const [hexInvalid, setHexInvalid] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setHexDraft(appearance.customBackground ?? hexForColorInput(null, appearance.theme));
				setHexInvalid(false);
			}, [appearance.customBackground, appearance.theme]);
			(0, react.useEffect)(() => {
				const onPointer = (event) => {
					const root = rootRef.current;
					if (root !== null && root.contains(event.target)) return;
					onClose();
				};
				const onKey = (event) => {
					if (event.key === "Escape") onClose();
				};
				const timer = window.setTimeout(() => {
					document.addEventListener("mousedown", onPointer, true);
					document.addEventListener("keydown", onKey, true);
				}, 0);
				return () => {
					window.clearTimeout(timer);
					document.removeEventListener("mousedown", onPointer, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, [onClose]);
			const commitHex = (raw) => {
				const normalized = normalizeHexColor(raw);
				if (normalized === null) {
					setHexInvalid(true);
					return false;
				}
				setHexInvalid(false);
				setHexDraft(normalized);
				store.setCustomBackground(normalized);
				return true;
			};
			const saveCurrentScheme = () => {
				const draft = hexDraft.trim();
				if (draft !== "") {
					const normalized = normalizeHexColor(draft);
					if (normalized === null) {
						setHexInvalid(true);
						return;
					}
					setHexInvalid(false);
					setHexDraft(normalized);
					store.setCustomBackground(normalized);
					store.saveScheme(normalized);
					return;
				}
				store.saveScheme();
			};
			const pickerValue = hexForColorInput(normalizeHexColor(hexDraft) ?? appearance.customBackground, appearance.theme);
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: editor_module_css_default.appearanceMenu,
				role: "dialog",
				"aria-label": t("editorAppearance"),
				"data-file-explorer-appearance": "",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceLabel,
							children: t("editorTheme")
						}), (0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceThemeRow,
							role: "radiogroup",
							"aria-label": t("editorTheme"),
							children: (hasImportedTheme ? [
								...THEME_OPTIONS,
								{
									id: VSCODE_THEME_ID,
									labelKey: "editorThemeVscode"
								}
							] : THEME_OPTIONS).map((option) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "radio",
								"aria-checked": appearance.customBackground === null && appearance.theme === option.id,
								className: appearance.customBackground === null && appearance.theme === option.id ? `${editor_module_css_default.appearanceChip} ${editor_module_css_default.appearanceChipActive}` : editor_module_css_default.appearanceChip,
								onClick: () => store.setTheme(option.id),
								children: t(option.labelKey)
							}, option.id))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceLabel,
								children: t("editorCustomColor")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: editor_module_css_default.appearanceColorRow,
								children: [
									(0, react_jsx_runtime.jsx)("input", {
										type: "color",
										className: editor_module_css_default.appearanceColorSwatch,
										value: pickerValue,
										"aria-label": t("editorCustomColor"),
										onChange: (event) => {
											commitHex(event.target.value);
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "text",
										className: hexInvalid ? `${editor_module_css_default.appearanceHexInput} ${editor_module_css_default.appearanceHexInvalid}` : editor_module_css_default.appearanceHexInput,
										value: hexDraft,
										spellCheck: false,
										placeholder: "#1e1e1e",
										"aria-invalid": hexInvalid,
										"aria-label": t("editorCustomColor"),
										onChange: (event) => {
											setHexDraft(event.target.value);
											setHexInvalid(false);
										},
										onBlur: () => {
											if (hexDraft.trim() === "") {
												store.setCustomBackground(null);
												setHexDraft(hexForColorInput(null, appearance.theme));
												setHexInvalid(false);
												return;
											}
											commitHex(hexDraft);
										},
										onKeyDown: (event) => {
											if (event.key === "Enter") {
												event.preventDefault();
												commitHex(hexDraft);
											}
										}
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: editor_module_css_default.appearanceStep,
										disabled: appearance.customBackground === null,
										onClick: () => {
											store.setCustomBackground(null);
											setHexDraft(hexForColorInput(null, appearance.theme));
											setHexInvalid(false);
										},
										children: t("editorCustomColorClear")
									})
								]
							}),
							hexInvalid ? (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorCustomColorInvalid")
							}) : (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorCustomColorHint")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceLabel,
							children: t("editorFontSize")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: editor_module_css_default.appearanceFontRow,
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: editor_module_css_default.appearanceStep,
									"aria-label": t("editorFontSmaller"),
									disabled: appearance.fontSize <= 11,
									onClick: () => store.bumpFont(-1),
									children: "A−"
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: editor_module_css_default.appearanceFontValue,
									children: [appearance.fontSize, "px"]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: editor_module_css_default.appearanceStep,
									"aria-label": t("editorFontLarger"),
									disabled: appearance.fontSize >= 24,
									onClick: () => store.bumpFont(1),
									children: "A+"
								})
							]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: appearance.minimap === true ? `${editor_module_css_default.appearanceChip} ${editor_module_css_default.appearanceChipActive}` : editor_module_css_default.appearanceChip,
							"aria-pressed": appearance.minimap === true,
							onClick: () => store.setMinimap(!(appearance.minimap === true)),
							children: t("editorMinimap")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceLabel,
								children: t("editorScheme")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.appearanceSaveScheme,
								onClick: saveCurrentScheme,
								children: t("editorSchemeSave")
							}),
							appearance.schemes.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorSchemeEmpty")
							}) : (0, react_jsx_runtime.jsx)("ul", {
								className: editor_module_css_default.appearanceSchemeList,
								"aria-label": t("editorScheme"),
								children: appearance.schemes.map((scheme) => {
									const active = appearance.customBackground === scheme.background && appearance.fontSize === scheme.fontSize;
									return (0, react_jsx_runtime.jsxs)("li", {
										className: editor_module_css_default.appearanceSchemeItem,
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: active ? `${editor_module_css_default.appearanceSchemeApply} ${editor_module_css_default.appearanceSchemeApplyActive}` : editor_module_css_default.appearanceSchemeApply,
											onClick: () => store.applyScheme(scheme.id),
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: editor_module_css_default.appearanceSchemeSwatch,
												style: { background: scheme.background },
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: editor_module_css_default.appearanceSchemeMeta,
												children: [
													scheme.background,
													" · ",
													scheme.fontSize,
													"px"
												]
											})]
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: editor_module_css_default.appearanceSchemeRemove,
											"aria-label": t("editorSchemeRemove"),
											onClick: () => store.removeScheme(scheme.id),
											children: "×"
										})]
									}, scheme.id);
								})
							})
						]
					})
				]
			});
		}
		//#endregion
