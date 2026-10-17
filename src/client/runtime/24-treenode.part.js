		//#region lib/types/client/explorer/TreeNode.js
		/**
		* Single tree node with lazy children; rename/create via inline edit + context menu.
		*/
		function FolderIcon({ open = false }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.icon,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
						d: open ? "M1.5 5h13l-1.4 8h-12zM2 3h4.5l1 1.5H14V6H2z" : "M1.5 3.5h5l1 1.5h7v8h-13z",
					opacity: "0.85"
				})
			});
		}
		function fileIconKind(name) {
			const lower = name.toLowerCase();
			if (lower === "package.json" || lower.endsWith(".json")) return "json";
			if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "ts";
			if (lower.endsWith(".jsx") || lower.endsWith(".mjs") || lower.endsWith(".js")) return "js";
			if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
			if (lower.endsWith(".css") || lower.endsWith(".scss")) return "css";
			if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
			if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
			if (lower.endsWith(".py")) return "py";
			if (lower.endsWith(".go")) return "go";
			if (lower.endsWith(".rs")) return "rs";
			if (lower.endsWith(".sh") || lower.endsWith(".ps1")) return "shell";
			return "file";
		}
		function FileIcon({ name }) {
			const kind = fileIconKind(name);
			const glyph = { ts: "TS", js: "JS", json: "{}", md: "M", css: "#", html: "<>", yaml: "Y", py: "Py", go: "Go", rs: "Rs", shell: ">_", file: "·" }[kind];
			return (0, react_jsx_runtime.jsx)("span", {
				className: "vscodeFileIcon",
				"data-file-kind": kind,
				"aria-hidden": "true",
				children: glyph
			});
		}
		function Chevron({ open }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.chevron,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				style: {
					transform: open ? "rotate(90deg)" : void 0,
					transition: "transform 0.12s"
				},
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: "M6 3l5 5-5 5z"
				})
			});
		}
		function joinPath(parent, name) {
			return parent === "" ? name : `${parent}/${name}`;
		}
		function parentPath(path) {
			return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
		}
		/**
		* Render one filesystem entry; directories expand lazily via `api.list`.
		*/
		function TreeNode(props) {
			const { entry, depth, api, t, activePath, selectedPath, onSelect, onOpenFile, onError, onTreeMutated, refreshToken, expandSignal, collapseSignal, external } = props;
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [children, setChildren] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [menu, setMenu] = (0, react.useState)(null);
			const [renaming, setRenaming] = (0, react.useState)(false);
			const [childDraft, setChildDraft] = (0, react.useState)(null);
			const loadChildren = (0, react.useCallback)(async () => {
				setLoading(true);
				const result = await api.list(entry.path);
				setLoading(false);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				setChildren(result.value.entries);
			}, [
				api,
				entry.path,
				onError
			]);
			(0, react.useEffect)(() => {
				if (!expanded) return;
				loadChildren();
			}, [
				expanded,
				refreshToken,
				loadChildren
			]);
			/**
			* Re-list this directory only when the host reported a change inside it.
			* `external` is a fresh object per batch, so this fires at most once per
			* poll for each affected directory instead of re-listing the whole tree.
			*/
			(0, react.useEffect)(() => {
				if (external === null || !expanded) return;
				if (!external.dirs.has(entry.path)) return;
				loadChildren();
			}, [
				external,
				expanded,
				entry.path,
				loadChildren
			]);
			(0, react.useEffect)(() => {
				if (expandSignal === 0 || entry.kind !== "dir") return;
				setExpanded(true);
			}, [expandSignal, entry.kind]);
			(0, react.useEffect)(() => {
				if (collapseSignal === 0 || entry.kind !== "dir") return;
				setExpanded(false);
			}, [collapseSignal, entry.kind]);
			(0, react.useEffect)(() => {
				if (entry.kind === "dir" && activePath?.startsWith(`${entry.path}/`)) setExpanded(true);
			}, [activePath, entry.kind, entry.path]);
			const toggleExpand = () => {
				if (entry.kind !== "dir") return;
				setExpanded((v) => !v);
			};
			const onRowClick = () => {
				if (renaming) return;
				onSelect(entry.path);
				if (entry.kind === "dir") {
					toggleExpand();
					return;
				}
				onOpenFile(entry.path);
			};
			const commitRename = async (name) => {
				setRenaming(false);
				if (name === entry.name) return;
				const to = joinPath(parentPath(entry.path), name);
				const result = await api.rename(entry.path, to);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onSelect(to);
				onTreeMutated();
			};
			const commitChildCreate = async (kind, name) => {
				setChildDraft(null);
				const path = joinPath(entry.path, name);
				if (kind === "file") {
					// -1 = "no expected revision": this file did not exist before.
					const result = await api.write(path, "", -1);
					if (!result.ok) {
						onError(result.error.message);
						return;
					}
					onTreeMutated();
					onSelect(path);
					onOpenFile(path);
					return;
				}
				const result = await api.mkdir(path);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onSelect(path);
				onTreeMutated();
			};
			const startChildDraft = (kind) => {
				setExpanded(true);
				setChildDraft(kind);
			};
			const remove = async () => {
				if (!window.confirm(t("confirmDelete", { name: entry.name }))) return;
				const result = await api.unlink(entry.path);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onTreeMutated();
			};
			const revealInFileManager = async () => {
				const result = await api.revealPath(entry.path);
				if (!result.ok) onError(result.error.message);
			};
			const selected = entry.path === selectedPath;
			const opened = entry.path === activePath;
			const rowRef = (0, react.useRef)(null);
			const rowClass = [
				explorer_module_css_default.row,
				selected ? explorer_module_css_default.rowSelected : "",
				opened && !selected ? explorer_module_css_default.rowOpened : ""
			].filter(Boolean).join(" ");
			(0, react.useEffect)(() => {
				if (!selected) return;
				const row = rowRef.current;
				if (row === null) return;
				const id = window.requestAnimationFrame(() => {
					scrollTreeRowIntoView(row);
				});
				return () => window.cancelAnimationFrame(id);
			}, [selected, expanded]);
			const menuItems = entry.kind === "dir" ? [
				{
					id: "expand-toggle",
					label: expanded ? t("collapse") : t("expand"),
					onSelect: () => {
						toggleExpand();
					}
				},
				{
					id: "reveal",
					label: t("revealPathInFileManager"),
					onSelect: () => {
						revealInFileManager();
					}
				},
				{
					id: "new-file",
					label: t("newFile"),
					onSelect: () => {
						startChildDraft("file");
					}
				},
				{
					id: "new-folder",
					label: t("newFolder"),
					onSelect: () => {
						startChildDraft("dir");
					}
				},
				{
					id: "rename",
					label: t("rename"),
					onSelect: () => {
						setRenaming(true);
					}
				},
				{
					id: "delete",
					label: t("delete"),
					danger: true,
					onSelect: () => {
						remove();
					}
				}
			] : [
				{
					id: "reveal",
					label: t("revealPathInFileManager"),
					onSelect: () => {
						revealInFileManager();
					}
				},
				{
					id: "rename",
					label: t("rename"),
					onSelect: () => {
						setRenaming(true);
					}
				},
				{
					id: "delete",
					label: t("delete"),
					danger: true,
					onSelect: () => {
						remove();
					}
				}
			];
			return (0, react_jsx_runtime.jsxs)("li", { children: [
				renaming ? (0, react_jsx_runtime.jsx)(InlineNameInput, {
					depth,
					kind: entry.kind,
					initialValue: entry.name,
					placeholder: t("promptRename"),
					ariaLabel: t("rename"),
					onCancel: () => setRenaming(false),
					onCommit: (name) => {
						commitRename(name);
					}
				}) : (0, react_jsx_runtime.jsxs)("div", {
					ref: rowRef,
					className: rowClass,
					style: { paddingLeft: 8 + depth * 12 },
					title: entry.path || entry.name,
					"data-file-explorer-path": entry.path,
					"data-file-explorer-kind": entry.kind,
					"data-active-file": opened ? "true" : void 0,
					role: "treeitem",
					"aria-selected": selected,
					"aria-expanded": entry.kind === "dir" ? expanded : void 0,
					onClick: (event) => {
						event.currentTarget.focus();
						onRowClick();
					},
					onContextMenu: (event) => {
						event.preventDefault();
						event.stopPropagation();
						onSelect(entry.path);
						setMenu({
							x: event.clientX,
							y: event.clientY
						});
					},
					onKeyDown: (event) => {
						if (entry.kind === "dir" && event.key === "ArrowRight") {
							event.preventDefault();
							if (!expanded) {
								onSelect(entry.path);
								setExpanded(true);
							} else {
								const firstChild = event.currentTarget.parentElement?.querySelector('ul[role="group"] [role="treeitem"]');
								if (firstChild) {
									onSelect(firstChild.getAttribute("data-file-explorer-path"));
									firstChild.focus();
								}
							}
							return;
						}
						if (entry.kind === "dir" && event.key === "ArrowLeft") {
							event.preventDefault();
							if (expanded) {
								onSelect(entry.path);
								setExpanded(false);
							} else {
								const parent = event.currentTarget.closest('ul[role="group"]')?.parentElement?.querySelector(':scope > [role="treeitem"]');
								if (parent) {
									onSelect(parent.getAttribute("data-file-explorer-path"));
									parent.focus();
								}
							}
							return;
						}
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onRowClick();
						}
						if (event.key === "F2") {
							event.preventDefault();
							onSelect(entry.path);
							setRenaming(true);
						}
						if (event.key === "Delete") {
							event.preventDefault();
							event.stopPropagation();
							onSelect(entry.path);
							void remove();
						}
					},
					tabIndex: 0,
					children: [
						entry.kind === "dir" ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: explorer_module_css_default.chevronBtn,
							"aria-label": expanded ? t("collapse") : t("expand"),
							tabIndex: -1,
							onClick: (event) => {
								event.preventDefault();
								event.stopPropagation();
								onSelect(entry.path);
								toggleExpand();
							},
							children: (0, react_jsx_runtime.jsx)(Chevron, { open: expanded })
						}) : (0, react_jsx_runtime.jsx)("span", { className: explorer_module_css_default.chevronPlaceholder }),
						entry.kind === "dir" ? (0, react_jsx_runtime.jsx)(FolderIcon, { open: expanded }) : (0, react_jsx_runtime.jsx)(FileIcon, { name: entry.name }),
						(0, react_jsx_runtime.jsxs)("span", {
							className: explorer_module_css_default.label,
							children: [entry.name, loading ? "…" : ""]
						})
					]
				}),
				menu !== null ? (0, react_jsx_runtime.jsx)(ExplorerContextMenu, {
					x: menu.x,
					y: menu.y,
					onClose: () => setMenu(null),
					items: menuItems
				}) : null,
				entry.kind === "dir" && expanded ? (0, react_jsx_runtime.jsxs)("ul", {
					className: explorer_module_css_default.children,
					role: "group",
					children: [
						childDraft !== null ? (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)(InlineNameInput, {
							depth: depth + 1,
							kind: childDraft,
							initialValue: "",
							placeholder: childDraft === "file" ? t("promptNewFile") : t("promptNewFolder"),
							ariaLabel: childDraft === "file" ? t("newFile") : t("newFolder"),
							onCancel: () => setChildDraft(null),
							onCommit: (name) => {
								commitChildCreate(childDraft, name);
							}
						}) }, `draft-${childDraft}`) : null,
						children !== null ? children.map((child) => (0, react_jsx_runtime.jsx)(TreeNode, {
							entry: child,
							depth: depth + 1,
							api,
							t,
							activePath,
							selectedPath,
							onSelect,
							onOpenFile,
							onError,
							onTreeMutated,
							refreshToken,
							expandSignal,
							collapseSignal,
							external
						}, child.path)) : null,
						children !== null && children.length === 0 && childDraft === null ? (0, react_jsx_runtime.jsx)("li", {
							className: explorer_module_css_default.emptyChild,
							style: { paddingLeft: 8 + (depth + 1) * 12 },
							children: t("emptyWorkspace")
						}) : null
					]
				}) : null
			] });
		}
		//#endregion
