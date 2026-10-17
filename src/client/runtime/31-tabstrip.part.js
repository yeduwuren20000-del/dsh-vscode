		//#region lib/types/client/editor/TabStrip.js
		/**
		* Tab strip for open editor buffers, with close + context-menu actions.
		*/
		/**
		* Horizontal list of open paths with dirty marks, close buttons, and
		* right-click: close / close to the right / close all.
		*/
		function TabStrip(props) {
			const { tabs, activePath, buffers, t, onActivate, onClose, onClosePaths } = props;
			const [menu, setMenu] = (0, react.useState)(null);
			const stripRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				stripRef.current?.querySelector('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
			}, [activePath]);
			const closeMenu = (0, react.useCallback)(() => {
				setMenu(null);
			}, []);
			const menuItems = menu === null ? [] : (() => {
				const index = tabs.findIndex((tab) => tab.path === menu.path);
				const toRight = index >= 0 ? tabs.slice(index + 1).map((tab) => tab.path) : [];
				return [
					{
						id: "close",
						label: t("tabClose"),
						onSelect: () => {
							onClose(menu.path);
						}
					},
					{
						id: "close-right",
						label: t("tabCloseRight"),
						disabled: toRight.length === 0,
						onSelect: () => {
							if (toRight.length === 0) return;
							onClosePaths(toRight);
						}
					},
					{
						id: "close-all",
						label: t("tabCloseAll"),
						onSelect: () => {
							onClosePaths(tabs.map((tab) => tab.path));
						}
					}
				];
			})();
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: stripRef,
				className: editor_module_css_default.tabs,
				role: "tablist",
				children: [tabs.map((tab) => {
					const active = tab.path === activePath;
					const dirty = buffers.isDirty(tab.path);
					const sameName = tabs.some((other) => other.path !== tab.path && other.title === tab.title);
					const parent = tab.path.replaceAll("\\", "/").split("/").slice(-2, -1)[0] ?? "";
					return (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						"aria-label": tab.path,
						title: tab.path,
						"data-file-explorer-tab-path": tab.path,
						className: active ? `${editor_module_css_default.tab} ${editor_module_css_default.tabActive}` : editor_module_css_default.tab,
						onClick: () => onActivate(tab.path),
						onAuxClick: (event) => {
							if (event.button === 1) {
								event.preventDefault();
								onClose(tab.path);
							}
						},
						onContextMenu: (event) => {
							event.preventDefault();
							event.stopPropagation();
							onActivate(tab.path);
							setMenu({
								x: event.clientX,
								y: event.clientY,
								path: tab.path
							});
						},
						children: [(0, react_jsx_runtime.jsx)(FileIcon, { name: tab.title }), (0, react_jsx_runtime.jsxs)("span", { className: "vscodeTabLabel", children: [tab.title, sameName && parent !== "" ? (0, react_jsx_runtime.jsx)("span", { className: "vscodeTabContext", children: parent }) : null, dirty ? (0, react_jsx_runtime.jsx)("span", {
							className: editor_module_css_default.dirtyMark,
							children: " •"
						}) : null] }), (0, react_jsx_runtime.jsx)("span", {
							className: editor_module_css_default.closeBtn,
							role: "button",
							tabIndex: 0,
							"aria-label": t("tabClose"),
							onClick: (event) => {
								event.stopPropagation();
								onClose(tab.path);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									event.stopPropagation();
									onClose(tab.path);
								}
							},
							children: "×"
						})]
					}, tab.path);
				}), menu !== null ? (0, react_jsx_runtime.jsx)(ExplorerContextMenu, {
					x: menu.x,
					y: menu.y,
					items: menuItems,
					onClose: closeMenu
				}) : null]
			});
		}
		//#endregion
