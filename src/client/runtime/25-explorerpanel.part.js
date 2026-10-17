		//#region lib/types/client/explorer/ExplorerPanel.js
		/**
		* Sidebar explorer panel: workspace header + icon actions + root listing.
		*/
		var PanelBoundary = class extends react.Component {
			state = { message: null };
			static getDerivedStateFromError(error) {
				return { message: error.message };
			}
			componentDidCatch(error, info) {
				console.error("[dsh-vscode] panel crash", error, info);
			}
			render() {
				if (this.state.message !== null) return (0, react_jsx_runtime.jsx)("div", {
					className: explorer_module_css_default.errorBanner,
					children: this.state.message
				});
				return this.props.children;
			}
		};
		/** Basename for display; browser bundle may not have node:path — keep a fallback. */
		function workspaceLabel(root) {
			const normalized = root.replaceAll("\\", "/").replace(/\/+$/, "");
			return (normalized.includes("/") ? normalized.slice(normalized.lastIndexOf("/") + 1) : normalized) || root || "workspace";
		}
		/**
		* Root listing with create-file / create-dir actions.
		*/
		function ExplorerPanel(props) {
			return (0, react_jsx_runtime.jsx)(PanelBoundary, { children: (0, react_jsx_runtime.jsx)(ExplorerPanelInner, { ...props }) });
		}
		function ExplorerPanelInner(props) {
			const { ctx, api, tabs, onOpenFile, external, sessionId, sessionCwd, sessionTitle } = props;
			const t = useExplorerT(ctx);
			const activePath = (0, react.useSyncExternalStore)(tabs.subscribe, () => tabs.getSnapshot().activePath);
			const [entries, setEntries] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)(null);
			const [refreshToken, setRefreshToken] = (0, react.useState)(0);
			const [expandSignal, setExpandSignal] = (0, react.useState)(0);
			const [collapseSignal, setCollapseSignal] = (0, react.useState)(0);
			const [rootDraft, setRootDraft] = (0, react.useState)(null);
			const [selectedPath, setSelectedPath] = (0, react.useState)(null);
			const [rootPath, setRootPath] = (0, react.useState)("");
			const [wsMenuOpen, setWsMenuOpen] = (0, react.useState)(false);
			const [workspaceList, setWorkspaceList] = (0, react.useState)([]);
			/**
			* The folder that belongs to THIS session, as resolved by the pin. Empty
			* until the pin lands (or when it could not resolve one at all), which is
			* exactly when the ownership strip below must stay hidden.
			*/
			const [sessionDir, setSessionDir] = (0, react.useState)("");
			/**
			* What the host found in this session's own log: how many files it
			* produced vs. merely read. `null` until the first collection lands.
			*/
			const [sessionFiles, setSessionFiles] = (0, react.useState)(null);
			const onSessionResolved = (0, react.useCallback)((path, files) => {
				setSessionDir(path);
				setSessionFiles(files);
			}, []);
			/** Bumped on every menu open/close so a stale async list is discarded. */
			const wsMenuToken = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				if (activePath !== null) setSelectedPath(activePath);
			}, [activePath]);
			const reload = (0, react.useCallback)(async () => {
				const [listResult, rootResult] = await Promise.all([api.list(""), api.getRoot()]);
				if (rootResult.ok) setRootPath(rootResult.value.root);
				if (!listResult.ok) {
					setError(listResult.error.message);
					return;
				}
				setError(null);
				setEntries(listResult.value.entries);
			}, [api]);
			/* The root follows the session this view renders — see useSessionRootPin. */
			const holdPin = useSessionRootPin(sessionId, sessionCwd, sessionTitle, api, reload, onSessionResolved);
			(0, react.useEffect)(() => {
				reload();
			}, [reload, refreshToken]);
			/** A change at the workspace root (a new or removed top-level entry). */
			(0, react.useEffect)(() => {
				if (external === null) return;
				if (!external.dirs.has("")) return;
				reload();
			}, [external, reload]);
			const bump = () => {
				setRefreshToken((n) => n + 1);
			};
			/**
			 * The root can move without this panel asking — the session pin owns it
			 * and re-roots the explorer whenever the open session changes. Re-read
			 * both the root and the listing on that signal, otherwise the tree keeps
			 * showing the previous session's folder.
			 */
			(0, react.useEffect)(() => {
				const onRoot = () => {
					setSelectedPath(null);
					bump();
				};
				window.addEventListener("file-explorer:root-changed", onRoot);
				return () => window.removeEventListener("file-explorer:root-changed", onRoot);
			}, []);
			const commitRootCreate = async (kind, name) => {
				setRootDraft(null);
				const path = name;
				if (kind === "file") {
					// -1 = "no expected revision": this file did not exist before.
					const result = await api.write(path, "", -1);
					if (!result.ok) {
						setError(result.error.message);
						return;
					}
					bump();
					setSelectedPath(path);
					onOpenFile(path);
					return;
				}
				const result = await api.mkdir(path);
				if (!result.ok) {
					setError(result.error.message);
					return;
				}
				bump();
				setSelectedPath(path);
			};
			const revealRoot = async () => {
				const result = await api.revealRoot();
				if (!result.ok) setError(result.error.message);
			};
			/** Switch the host root — used by the workspace picker, the breadcrumb and the session strip. */
			const setRootTo = async (path) => {
				/* Hand-driven navigation wins: without this the next session-list
				 * update would drag the tree back to the session folder. */
				holdPin();
				const result = await api.setRoot(path);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				setSelectedPath(null);
				bump();
				/* PATCH(2026-10-13): the subagent seat is scoped to the root — tell it. */
				window.dispatchEvent(new CustomEvent("file-explorer:root-changed", { detail: { root: result.value.root } }));
			};
			/**
			* Every folder this app already treats as a workspace, in the order the
			* left rail renders them.
			*
			* PATCH(2026-10-13): the authoritative source is the host's
			* `workspaceRegistry` (see `listWorkspaces` in the host service) — the
			* same durable records that back the left-rail workspace rows, each with
			* its own `path`. Reading it is what makes "one workspace ⇄ one folder"
			* hold: choosing a workspace roots the explorer at THAT workspace's
			* directory instead of at whatever cwd the open session happens to carry.
			*
			* Reading session cwds is kept as a fallback (and a union) because the
			* host profile may not load the workspace bundle, and because a session
			* cwd is still a meaningful folder to jump to even when it is not yet a
			* registered workspace.
			*/
			const collectWorkspaces = async () => {
				const out = [];
				const seen = new Set();
				const push = (value, label) => {
					if (typeof value !== "string" || value.trim() === "") return;
					const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
					const key = normalized.toLowerCase();
					if (seen.has(key)) return;
					seen.add(key);
					out.push({
						path: value,
						label: typeof label === "string" && label !== "" ? label : workspaceLabel(value)
					});
				};
				try {
					const result = await api.listWorkspaces();
					console.info("[dsh-vscode] workspaceRegistry:", result.ok ? `${result.value.workspaces.length} entr${result.value.workspaces.length === 1 ? "y" : "ies"}` : `unavailable (${result.error.message})`);
					if (result.ok) for (const entry of result.value.workspaces) push(entry.path, entry.title);
				} catch {
					/* host registry unavailable — session cwds still apply */
				}
				try {
					const sessions = ctx.sessions;
					if (sessions !== void 0) {
						const snap = sessions.list.getSnapshot();
						for (const sessionId of Object.keys(snap.byId ?? {})) push(snap.byId[sessionId]?.cwd);
					}
				} catch {
					/* sessions service is optional */
				}
				/* The live root is normally a session folder NESTED inside one of the
				 * workspaces above, and that row already exists under its parent —
				 * surfacing it again would read as a phantom fourth workspace. Only a
				 * root that lies outside every known workspace (a folder opened by
				 * hand) earns its own row. */
				const flat = (value) => value.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
				const here = flat(rootPath);
				const nested = out.some((entry) => {
					const base = flat(entry.path);
					return here === base || here.startsWith(`${base}/`);
				});
				if (!nested) push(rootPath);
				return out;
			};
			const toggleWorkspaceMenu = () => {
				if (wsMenuOpen) {
					wsMenuToken.current++;
					setWsMenuOpen(false);
					return;
				}
				setWorkspaceList([]);
				setWsMenuOpen(true);
				const token = ++wsMenuToken.current;
				void collectWorkspaces().then((list) => {
					/* Drop the result when the menu closed (or reopened) meanwhile. */
					if (wsMenuToken.current !== token) return;
					setWorkspaceList(list);
				});
			};
			/** True when `path` is the folder the explorer is currently rooted at. */
			const isCurrentWorkspace = (path) => {
				if (typeof rootPath !== "string" || rootPath === "") return false;
				return rootPath.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase() === path.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
			};
			/** Root path split into clickable segments (`D:` / `30651` / `proj` …). */
			const crumbs = (() => {
				if (typeof rootPath !== "string" || rootPath === "") return [];
				const parts = rootPath.split(/[\\/]+/).filter((part) => part !== "");
				let acc = "";
				return parts.map((part, index) => {
					acc = index === 0 ? part : `${acc}/${part}`;
					return {
						label: part,
						path: index === 0 ? `${part}/` : acc,
						clickable: index > 0
					};
				});
			})();
			const title = workspaceLabel(rootPath);
			/** True while the tree really is rooted at this session's own folder. */
			const atSessionDir = sessionDir !== "" && isCurrentWorkspace(sessionDir);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: explorer_module_css_default.panel,
				"data-file-explorer-panel": "",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: explorer_module_css_default.toolbar,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								display: "flex",
								alignItems: "center",
								minWidth: 0,
								flex: 1
							},
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "workspacePicker",
								title: rootPath || void 0,
								"aria-haspopup": "menu",
								"aria-expanded": wsMenuOpen ? "true" : "false",
								onClick: toggleWorkspaceMenu,
								children: [(0, react_jsx_runtime.jsx)("span", {
									style: { overflow: "hidden", textOverflow: "ellipsis" },
									children: title
								}), (0, react_jsx_runtime.jsx)("span", {
									style: { opacity: .5, fontSize: "10px", flexShrink: 0 },
									children: "▾"
								})]
							}), wsMenuOpen ? (0, react_jsx_runtime.jsx)("div", {
								style: { position: "fixed", inset: 0, zIndex: 29 },
								onClick: () => setWsMenuOpen(false)
							}) : null, wsMenuOpen ? (0, react_jsx_runtime.jsx)("div", {
								className: "workspaceMenu",
								role: "menu",
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "menuitem",
								className: "workspaceMenuItem",
								onClick: () => {
									const input = window.prompt(t("wsPrompt"), rootPath);
									if (typeof input === "string" && input.trim() !== "") {
										setWsMenuOpen(false);
										void setRootTo(input.trim());
									}
								},
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: "workspaceMenuLabel",
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: "workspaceMenuCheck",
										style: { visibility: "hidden" },
										children: "✓"
									}), t("wsOpenOther")]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: "workspaceMenuSection",
									children: t("wsWorkspaces")
								})]
						}), workspaceList.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: "workspaceMenuHint",
							children: t("wsLoading")
						}) : null, workspaceList.map((entry) => {
							const current = isCurrentWorkspace(entry.path);
							return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "menuitem",
								className: "workspaceMenuItem",
								"data-current": current ? "true" : void 0,
								title: entry.path,
								onClick: () => {
									setWsMenuOpen(false);
									void setRootTo(entry.path);
								},
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: "workspaceMenuLabel",
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: "workspaceMenuCheck",
										style: { visibility: current ? "visible" : "hidden" },
										children: "✓"
									}), entry.label]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: "workspaceMenuPath",
									children: entry.path
								})]
							}, entry.path)] }, `ws:${entry.path}`);
						})]
							}) : null]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: explorer_module_css_default.toolbarActions,
							children: [
								(0, react_jsx_runtime.jsx)(NewFileIconButton, {
									title: t("newFile"),
									onClick: () => setRootDraft("file")
								}),
								(0, react_jsx_runtime.jsx)(NewFolderIconButton, {
									title: t("newFolder"),
									onClick: () => setRootDraft("dir")
								}),
								(0, react_jsx_runtime.jsx)(ExpandAllIconButton, {
									title: t("expandAll"),
									onClick: () => setExpandSignal((n) => n + 1)
								}),
								(0, react_jsx_runtime.jsx)(CollapseAllIconButton, {
									title: t("collapseAll"),
									onClick: () => setCollapseSignal((n) => n + 1)
								}),
								(0, react_jsx_runtime.jsx)(RefreshIconButton, {
									title: t("refresh"),
									onClick: () => bump()
								}),
								(0, react_jsx_runtime.jsx)(RevealIconButton, {
									title: t("openInFileManager"),
									onClick: () => void revealRoot()
								})
							]
						})]
					}), crumbs.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "treeCrumbs",
						children: crumbs.map((crumb, index) => (0, react_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								minWidth: 0
							},
							children: [index > 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: "crumbSep",
								children: "/"
							}) : null, crumb.clickable ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								title: crumb.path,
								onClick: () => void setRootTo(crumb.path),
								children: crumb.label
							}) : (0, react_jsx_runtime.jsx)("span", {
								children: crumb.label
							})]
						}, crumb.path))
					}) : null,
					/*
					* Says out loud whose folder the tree is showing. The pin roots the
					* tree at the session's own folder silently, and a silent pin is
					* indistinguishable from "the explorer opened the wrong place" —
					* which is exactly how it was read. One row, one jump.
					*/
					sessionId !== "" && sessionDir !== "" ? (0, react_jsx_runtime.jsx)("div", {
						className: "sessionStrip",
						"data-file-explorer-session-strip": atSessionDir ? "self" : "elsewhere",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripBadge",
							children: t("sessionFolderBadge")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripName",
							title: sessionDir,
							children: sessionTitle.trim() === "" ? t("sessionFolderUnnamed") : sessionTitle.trim()
						}), sessionFiles !== null && sessionFiles.total > 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripFiles",
							title: sessionFiles.transcript,
							children: `${t("sessionFilesProduced")} ${sessionFiles.produced} · ${t("sessionFilesTotal")} ${sessionFiles.total}`
						}) : null, (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "sessionStripJump",
							title: atSessionDir ? sessionCwd : sessionDir,
							onClick: () => void setRootTo(atSessionDir ? sessionCwd : sessionDir),
							children: atSessionDir ? t("sessionFolderWorkspace") : t("sessionFolderSelf")
						})]
					}) : null,
					error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.errorBanner,
						children: error
					}) : null,
					entries.length === 0 && rootDraft === null ? (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.empty,
						children: t("emptyWorkspace")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.treeScroll,
						"data-file-explorer-tree-scroll": "",
						onKeyDown: (event) => {
							if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
							if (event.target.closest("[data-file-explorer-inline-edit]")) return;
							const rows = Array.from(event.currentTarget.querySelectorAll('[role="treeitem"]'));
							if (rows.length === 0) return;
							const focused = event.target.closest('[role="treeitem"]');
							const selected = rows.findIndex((row) => row.getAttribute("aria-selected") === "true");
							const current = Math.max(0, focused === null ? selected : rows.indexOf(focused));
							const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : Math.max(0, Math.min(rows.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
							const row = rows[next];
							const path = row.getAttribute("data-file-explorer-path");
							if (path !== null) setSelectedPath(path);
							row.focus();
							row.scrollIntoView({ block: "nearest" });
							event.preventDefault();
							event.stopPropagation();
						},
						children: (0, react_jsx_runtime.jsxs)("ul", {
							className: explorer_module_css_default.tree,
							role: "tree",
							children: [rootDraft !== null ? (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)(InlineNameInput, {
								depth: 0,
								kind: rootDraft,
								initialValue: "",
								placeholder: rootDraft === "file" ? t("promptNewFile") : t("promptNewFolder"),
								ariaLabel: rootDraft === "file" ? t("newFile") : t("newFolder"),
								onCancel: () => setRootDraft(null),
								onCommit: (name) => {
									commitRootCreate(rootDraft, name);
								}
							}) }, `draft-${rootDraft}`) : null, entries.map((entry) => (0, react_jsx_runtime.jsx)(TreeNode, {
								entry,
								depth: 0,
								api,
								t,
								activePath,
								selectedPath,
								onSelect: setSelectedPath,
								onOpenFile,
								onError: setError,
								onTreeMutated: bump,
								refreshToken,
								expandSignal,
								collapseSignal,
								external
							}, entry.path))]
						})
					})
				]
			});
		}
		//#endregion
