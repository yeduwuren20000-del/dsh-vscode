		//#region lib/types/client/settings/ExplorerSettingsCard.js
		/**
		* Settings → Plugins card for file explorer preferences.
		*/
		function ChevronDown({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				className,
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
					fill: "currentColor"
				})
			});
		}
		/** Collapsed-by-default plugin configuration card. */
		function ExplorerSettingsCard(props) {
			const { ctx, scope } = props;
			const snap = (0, react.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot());
			const t = explorerT((0, react.useSyncExternalStore)((listener) => ctx.locale.subscribe(listener), () => ctx.locale.getSnapshot().active));
			const [open, setOpen] = (0, react.useState)(false);
			const [draftRoot, setDraftRoot] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const available = snap.status === "ready";
			const writable = snap.writable;
			const value = snap.value;
			if (!available || value === void 0) return null;
			const hasRootField = value.root !== void 0;
			const rootValue = draftRoot ?? value.root;
			const openLinks = value.openLinksInEditor;
			const commitRoot = (0, react.useCallback)(async () => {
				if (!writable || saving || draftRoot === null) return;
				setSaving(true);
				try {
					await scope.set("root", draftRoot);
					setDraftRoot(null);
				} finally {
					setSaving(false);
				}
			}, [
				draftRoot,
				saving,
				scope,
				writable
			]);
			const toggleLinks = (0, react.useCallback)(async (checked) => {
				if (!writable || saving) return;
				setSaving(true);
				try {
					await scope.set("openLinksInEditor", checked);
				} finally {
					setSaving(false);
				}
			}, [
				saving,
				scope,
				writable
			]);
			const title = t("settingsTitle");
			return (0, react_jsx_runtime.jsxs)("li", {
				className: open ? `${settings_card_module_css_default.card} ${settings_card_module_css_default.cardOpen}` : settings_card_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: settings_card_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
					onClick: () => {
						setOpen((v) => !v);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: title
						}), (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							children: t("settingsDescription")
						})]
					}), (0, react_jsx_runtime.jsx)(ChevronDown, { className: [settings_card_module_css_default.chevron, open ? settings_card_module_css_default.chevronOpen : void 0].filter(Boolean).join(" ") })]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						!writable ? (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.readOnly,
							role: "status",
							children: t("readOnly")
						}) : null,
						hasRootField ? (0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [
								(0, react_jsx_runtime.jsx)("label", {
									className: settings_card_module_css_default.label,
									htmlFor: "fe-root",
									children: t("settingsRoot")
								}),
								(0, react_jsx_runtime.jsx)("input", {
									id: "fe-root",
									className: settings_card_module_css_default.textInput,
									value: rootValue,
									disabled: !writable || saving,
									onChange: (event) => setDraftRoot(event.target.value),
									onBlur: () => {
										commitRoot();
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") commitRoot();
									}
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: settings_card_module_css_default.hint,
									children: t("settingsRootHint")
								})
							]
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								className: writable ? settings_card_module_css_default.row : `${settings_card_module_css_default.row} ${settings_card_module_css_default.rowDisabled}`,
								children: [(0, react_jsx_runtime.jsx)("input", {
									className: settings_card_module_css_default.checkbox,
									type: "checkbox",
									checked: openLinks,
									disabled: !writable || saving,
									onChange: (event) => {
										toggleLinks(event.target.checked);
									}
								}), (0, react_jsx_runtime.jsx)("span", { children: t("settingsOpenLinks") })]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: settings_card_module_css_default.hint,
								children: t("settingsOpenLinksHint")
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
