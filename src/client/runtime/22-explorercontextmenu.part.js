		//#region lib/types/client/explorer/ExplorerContextMenu.js
		/**
		* Floating context menu for explorer rows (rename / delete).
		*/
		/**
		* Fixed-position menu; closes on outside click, Escape, or item select.
		*/
		function ExplorerContextMenu(props) {
			const { x, y, items, onClose } = props;
			const rootRef = (0, react.useRef)(null);
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
			const maxX = typeof window !== "undefined" ? window.innerWidth - 8 : x;
			const maxY = typeof window !== "undefined" ? window.innerHeight - 8 : y;
			const left = Math.min(x, maxX - 160);
			const top = Math.min(y, maxY - 88);
			return (0, react_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: explorer_module_css_default.contextMenu,
				style: {
					left,
					top
				},
				role: "menu",
				"data-file-explorer-context-menu": "",
				children: items.map((item) => (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "menuitem",
					disabled: item.disabled === true,
					className: item.danger === true ? `${explorer_module_css_default.contextItem} ${explorer_module_css_default.contextItemDanger}` : explorer_module_css_default.contextItem,
					onClick: () => {
						if (item.disabled === true) return;
						onClose();
						item.onSelect();
					},
					children: item.label
				}, item.id))
			});
		}
		//#endregion
