		//#region chrome.css — VS Code-flavoured chrome (host tab strip + explorer surfaces)
		/**
		* Chrome polish for two surfaces the plugin does not own outright.
		*
		* 1. The host occupant tab strip (the raw `对话 | 文件` pair in the middle
		*    column header). It ships as two unstyled buttons; we restyle them into
		*    editor tabs WITHOUT hiding or renaming anything, using class-SUFFIX
		*    selectors (`_tabs` / `_tabActive`) because the stems are hashed and
		*    change between DSH builds. Scoped under `[data-slot="conversation.header"]`
		*    so no other tab strip in the app is touched.
		* 2. The explorer's own tab strip / path bar / status line, nudged closer to
		*    VS Code. Scoped under `[data-file-explorer-panel]` and layered on top of
		*    the module CSS, so the original rules stay intact for rollback.
		*
		* Every colour goes through a `--dsw-alias-*` token with a light-theme
		* fallback, so this tracks light/dark automatically.
		*/
		const chromeCss = `
[data-file-explorer-view] {
	container: dsh-vscode-ide / inline-size;
}
[data-file-explorer-view] [class*="_filesView"] {
	padding-bottom: 24px;
}
/* When DSH's right sidebar leaves little room, use the Explorer as a drawer. */
@container dsh-vscode-ide (max-width: 720px) {
	[data-file-explorer-view] [class*="_treeCol"] {
		position: absolute;
		left: 44px;
		top: 0;
		bottom: 24px;
		z-index: 8;
		width: min(280px, calc(100% - 44px)) !important;
		max-width: none;
		box-shadow: 8px 0 22px color-mix(in srgb, #000 24%, transparent);
	}
	[data-file-explorer-view] [class*="_treeResize"] {
		display: none;
	}
}
[data-file-explorer-view] .vscodeActivityBar {
	box-sizing: border-box;
	width: 44px;
	flex: 0 0 44px;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 2px;
	padding-top: 5px;
	border-right: 1px solid var(--dsw-alias-border-l2);
	background: var(--dsw-alias-bg-layer-2);
}
[data-file-explorer-view] .vscodeActivityButton {
	appearance: none;
	position: relative;
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border: 0;
	background: transparent;
	color: var(--dsw-alias-label-secondary);
	cursor: pointer;
}
[data-file-explorer-view] .vscodeActivityButton:hover,
[data-file-explorer-view] .vscodeActivityButton:focus-visible {
	color: var(--dsw-alias-label-primary);
	background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
}
[data-file-explorer-view] .vscodeActivityButton:focus-visible {
	outline: 1px solid var(--dsw-alias-brand-primary);
	outline-offset: -2px;
}
[data-file-explorer-view] .vscodeActivityButton[aria-pressed="true"] {
	color: var(--dsw-alias-label-primary);
}
[data-file-explorer-view] .vscodeActivityButton[aria-pressed="true"]::before {
	content: "";
	position: absolute;
	top: 8px;
	bottom: 8px;
	left: 0;
	width: 2px;
	background: var(--dsw-alias-brand-primary);
}
[data-file-explorer-view] .vscodeActivityButton svg {
	width: 21px;
	height: 21px;
}
[data-slot="conversation.header"] div[class*="_tabs"] {
	display: none !important;
}

/* ---- explorer: our own view switch (replaces the hidden host tab strip) ---- */
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	padding: 2px;
	border-radius: 9px;
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 5%, transparent);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button {
	appearance: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 26px;
	padding: 0 10px;
	border: 1px solid transparent;
	border-radius: 7px;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font: inherit;
	font-size: 12.5px;
	font-weight: 500;
	line-height: 1;
	cursor: pointer;
	transition: background-color .14s ease, color .14s ease, box-shadow .14s ease;
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button[data-active="true"] {
	color: var(--dsw-alias-label-primary, #0f1115);
	font-weight: 600;
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: 0 1px 2px rgba(15, 17, 21, .08);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button svg {
	width: 14px;
	height: 14px;
	flex-shrink: 0;
}

/* ---- explorer: editor tab strip ---- */
[data-file-explorer-view] .VX-wEW_tabs {
	align-items: stretch;
	gap: 0;
	min-height: 36px;
	padding: 0;
	background: var(--dsw-alias-bg-layer-2);
	border-bottom: 1px solid var(--dsw-alias-border-l2);
}
[data-file-explorer-view] .VX-wEW_tab {
	gap: 6px;
	max-width: 220px;
	min-width: 92px;
	min-height: 35px;
	padding: 0 12px;
	border: 0;
	border-right: 1px solid var(--dsw-alias-border-l2);
	border-radius: 0;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font-size: 12.5px;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .VX-wEW_tab:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 6%, transparent);
}
[data-file-explorer-view] .VX-wEW_tabActive {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: inset 0 1px 0 var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-view] .VX-wEW_tab .VX-wEW_closeBtn {
	opacity: 0;
}
[data-file-explorer-view] .VX-wEW_tab:hover .VX-wEW_closeBtn,
[data-file-explorer-view] .VX-wEW_tabActive .VX-wEW_closeBtn,
[data-file-explorer-view] .VX-wEW_closeBtn:focus-visible {
	opacity: .8;
}
[data-file-explorer-view] .vscodeTabLabel {
	display: inline-flex;
	align-items: baseline;
	gap: 5px;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .vscodeTabContext {
	color: var(--dsw-alias-label-secondary, #858b91);
	font-size: 11px;
	font-weight: 400;
}
[data-file-explorer-view] .vscodeFileIcon {
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 0 0 16px;
	width: 16px;
	height: 16px;
	border-radius: 3px;
	background: color-mix(in srgb, currentColor 15%, transparent);
	font: 700 9px/1 ui-monospace, Consolas, monospace;
	letter-spacing: -.5px;
}
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="ts"] { color: #4ca7ed; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="js"] { color: #d4bb54; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="json"] { color: #a9c474; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="md"] { color: #a58cdd; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="css"] { color: #7bb1eb; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="html"] { color: #dd9065; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="yaml"] { color: #ba88a4; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="py"] { color: #c7ae71; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="go"] { color: #6ec3c3; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="rs"] { color: #c89b7a; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="shell"] { color: #9bbe8a; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="file"] { color: var(--dsw-alias-label-secondary, #858b91); }
[data-file-explorer-panel] [role="treeitem"] {
	min-width: 100%;
}
[data-file-explorer-panel] [role="treeitem"] .t3VzRa_icon {
	color: #d6ae6a;
}
[data-file-explorer-panel] [role="treeitem"][data-active-file="true"]:not([aria-selected="true"]) {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 10%, transparent);
}
[data-file-explorer-panel] [role="treeitem"][data-active-file="true"] .t3VzRa_label {
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-view] .VX-wEW_toolbar {
	min-height: 30px;
	gap: 4px;
	padding: 2px 8px;
}
[data-file-explorer-view] .VX-wEW_toolBtn {
	border-color: transparent;
	border-radius: 3px;
	background: transparent;
	padding: 3px 7px;
}
[data-file-explorer-view] .VX-wEW_toolBtn:hover,
[data-file-explorer-view] .VX-wEW_toolBtn:focus-visible {
	border-color: transparent;
	background: var(--dsw-alias-bg-layer-3);
}

/* ---- explorer: breadcrumb path bar (now clickable segments) ---- */
[data-file-explorer-view] .VX-wEW_pathBar {
	display: flex;
	align-items: center;
	gap: 1px;
	padding: 0 8px;
	min-height: 28px;
	font-size: 12px;
	justify-content: flex-start;
}
[data-file-explorer-view] .VX-wEW_pathBar > span {
	display: inline-flex;
	align-items: center;
	min-width: 0;
	flex-shrink: 1;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .VX-wEW_pathBar .vscodeCrumbFile {
	flex-shrink: 0;
	gap: 5px;
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-view] .VX-wEW_pathBar button {
	appearance: none;
	border: 1px solid transparent;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
	max-width: 220px;
	padding: 2px 6px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-view] .VX-wEW_pathBar button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-file-explorer-view] .VX-wEW_pathBar .crumbSep {
	opacity: .45;
	padding: 0 1px;
	user-select: none;
}

/* ---- explorer: VS Code-flavoured status bar ---- */
[data-file-explorer-view] .editorStatusBar {
	display: flex;
	align-items: center;
	gap: 12px;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
	height: 24px;
	padding: 0 10px;
	background: #007acc;
	color: #fff;
	font-size: 11.5px;
	font-variant-numeric: tabular-nums;
}
[data-file-explorer-view] .editorStatusBar .statusItem {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
[data-file-explorer-view] .editorStatusBar .statusDirty {
	color: #fff;
	font-weight: 600;
}

/* ---- explorer: tree breadcrumb + workspace switcher ---- */
[data-file-explorer-panel] .treeCrumbs {
	display: flex;
	align-items: center;
	gap: 1px;
	min-height: 26px;
	padding: 0 8px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
	background: var(--dsw-alias-bg-layer-2);
	color: var(--dsw-alias-label-secondary, #61666b);
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 11.5px;
	line-height: 1.4;
	white-space: nowrap;
	overflow: hidden;
}
[data-file-explorer-panel] .treeCrumbs button {
	appearance: none;
	border: 1px solid transparent;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
	max-width: 200px;
	padding: 2px 6px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-panel] .treeCrumbs button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-file-explorer-panel] .treeCrumbs .crumbSep {
	opacity: .45;
	padding: 0 1px;
	user-select: none;
	flex-shrink: 0;
}

/* ---- explorer: which session this tree belongs to ----
 * The pin silently roots the tree at the session's own folder, which is
 * correct but invisible: the user sees a path and has to trust that it is
 * theirs. This strip states the ownership and offers the one jump that
 * matters — back to the folder this session holds, or out to the workspace.
 */
[data-file-explorer-panel] .sessionStrip {
	display: flex;
	align-items: center;
	gap: 6px;
	min-height: 24px;
	padding: 0 8px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 9%, transparent);
	color: var(--dsw-alias-label-secondary, #61666b);
	font-size: 11.5px;
	white-space: nowrap;
	overflow: hidden;
}
[data-file-explorer-panel] .sessionStripBadge {
	flex-shrink: 0;
	padding: 1px 6px;
	border-radius: 999px;
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 22%, transparent);
	color: var(--dsw-alias-label-primary, #0f1115);
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: .3px;
}
[data-file-explorer-panel] .sessionStripName {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-panel] .sessionStripFiles {
	flex-shrink: 0;
	opacity: .78;
	font-variant-numeric: tabular-nums;
}
[data-file-explorer-panel] .sessionStripJump {
	appearance: none;
	flex-shrink: 0;
	padding: 1px 7px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
}
[data-file-explorer-panel] .sessionStripJump:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 45%, transparent);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 14%, transparent);
}

/* ---- explorer: tree toolbar workspace switcher ---- */
[data-file-explorer-panel] .workspacePicker {
	appearance: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 100%;
	padding: 3px 8px;
	border: 1px solid transparent;
	border-radius: 7px;
	background: transparent;
	color: inherit;
	font: inherit;
	font-size: 12.5px;
	font-weight: 600;
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-panel] .workspacePicker:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent);
}
[data-file-explorer-panel] .workspaceMenu {
	z-index: 30;
	position: absolute;
	top: calc(100% + 6px);
	left: 4px;
	min-width: 240px;
	max-width: 460px;
	max-height: 320px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 6px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	border-radius: 10px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: 0 10px 28px color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 14%, transparent);
}
[data-file-explorer-panel] .workspaceMenuItem {
	appearance: none;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 2px;
	width: 100%;
	padding: 6px 8px;
	border: 0;
	border-radius: 7px;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
}
[data-file-explorer-panel] .workspaceMenuItem:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
/* PATCH(2026-10-13): the workspace the explorer is currently rooted at. */
[data-file-explorer-panel] .workspaceMenuItem[data-current="true"] {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 12%, transparent);
}
[data-file-explorer-panel] .workspaceMenuItem[data-current="true"] .workspaceMenuLabel {
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
/* PATCH(2026-10-13): leading tick + trailing section label on the "open another" row. */
[data-file-explorer-panel] .workspaceMenuLabel {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12.5px;
	font-weight: 600;
}
[data-file-explorer-panel] .workspaceMenuCheck {
	flex-shrink: 0;
	width: 12px;
	font-size: 11px;
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-panel] .workspaceMenuSection {
	margin-left: auto;
	font-size: 11px;
	font-weight: 500;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-panel] .workspaceMenuHint {
	padding: 6px 8px;
	font-size: 12px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
/* ---- editor subagent seat (PATCH 2026-10-13) ---- */
[data-file-explorer-view] [class*="_editorCol"] > *:first-child {
	flex: 1 1 0%;
	min-height: 0;
}
[data-file-explorer-view] .eaPanel {
	flex-shrink: 0;
	position: relative;
	display: flex;
	flex-direction: column;
	min-height: 0;
	border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	background: var(--dsw-alias-bg-layer-2, #fafafa);
}
[data-file-explorer-view] .eaResize {
	position: absolute;
	top: -3px;
	left: 0;
	right: 0;
	height: 6px;
	z-index: 5;
	cursor: row-resize;
	touch-action: none;
}
[data-file-explorer-view] .eaResize:hover,
[data-file-explorer-view] .eaResize:active {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 35%, transparent);
}
[data-file-explorer-view] .eaHead {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
	padding: 2px 6px 2px 2px;
}
[data-file-explorer-view] .eaToggle {
	appearance: none;
	display: flex;
	align-items: center;
	gap: 6px;
	flex: 1;
	min-width: 0;
	padding: 4px 6px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
}
[data-file-explorer-view] .eaToggle:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent);
}
[data-file-explorer-view] .eaChevron {
	flex-shrink: 0;
	width: 10px;
	font-size: 10px;
	opacity: .6;
}
[data-file-explorer-view] .eaTitle {
	flex-shrink: 0;
	font-size: 12px;
	font-weight: 600;
}
[data-file-explorer-view] .eaModel {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 11px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaActions {
	display: flex;
	align-items: center;
	gap: 2px;
	flex-shrink: 0;
}
[data-file-explorer-view] .eaIconBtn {
	appearance: none;
	width: 22px;
	height: 22px;
	display: grid;
	place-items: center;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font-size: 12px;
	line-height: 1;
	cursor: pointer;
}
[data-file-explorer-view] .eaIconBtn:hover:not(:disabled) {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 9%, transparent);
}
[data-file-explorer-view] .eaIconBtn:disabled {
	opacity: .35;
	cursor: default;
}
[data-file-explorer-view] .eaBody {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 6px;
	min-height: 0;
	padding: 0 8px 8px;
}
[data-file-explorer-view] .eaTabs {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
	overflow-x: auto;
}
[data-file-explorer-view] .eaTab {
	appearance: none;
	flex-shrink: 0;
	padding: 3px 9px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	border-radius: 999px;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font: inherit;
	font-size: 11px;
	cursor: pointer;
}
[data-file-explorer-view] .eaTab[data-active="true"] {
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 55%, transparent);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 12%, transparent);
	color: var(--dsw-alias-brand-primary, #4c8bf5);
	font-weight: 600;
}
[data-file-explorer-view] .eaLog {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 8px;
	min-height: 0;
	padding: 2px;
	overflow-y: auto;
}
[data-file-explorer-view] .eaEmpty {
	padding: 10px 6px;
	font-size: 12px;
	line-height: 1.6;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaMsg {
	display: flex;
	flex-direction: column;
	gap: 3px;
	max-width: 100%;
}
[data-file-explorer-view] .eaWho {
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: .02em;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaText {
	padding: 6px 9px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .08));
	border-radius: 8px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	font-size: 12.5px;
	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-word;
}
[data-file-explorer-view] .eaMsgUser .eaText {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 9%, var(--dsw-alias-bg-layer-1, #fff));
}
[data-file-explorer-view] .eaMsgMain .eaText {
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 40%, var(--dsw-alias-border-l2, rgba(0, 0, 0, .08)));
}
[data-file-explorer-view] .eaMsgMain .eaWho {
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-view] .eaTyping {
	padding: 4px 2px;
	font-size: 12px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaError {
	flex-shrink: 0;
	padding: 5px 8px;
	border-radius: 6px;
	background: var(--dsw-alias-interactive-bg-hover-danger, rgba(198, 40, 40, .08));
	color: var(--dsw-alias-state-error-primary, #c62828);
	font-size: 11.5px;
	line-height: 1.5;
}
[data-file-explorer-view] .eaComposer {
	display: flex;
	align-items: flex-end;
	gap: 6px;
	flex-shrink: 0;
}
[data-file-explorer-view] .eaInput {
	flex: 1;
	min-width: 0;
	min-height: 48px;
	max-height: 160px;
	padding: 6px 8px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .12));
	border-radius: 8px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	color: inherit;
	font: inherit;
	font-size: 12.5px;
	line-height: 1.5;
	resize: vertical;
}
[data-file-explorer-view] .eaInput:focus {
	outline: none;
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 60%, transparent);
}
[data-file-explorer-view] .eaSend {
	appearance: none;
	flex-shrink: 0;
	height: 30px;
	padding: 0 12px;
	border: 0;
	border-radius: 8px;
	background: var(--dsw-alias-brand-primary, #4c8bf5);
	color: #fff;
	font: inherit;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
}
[data-file-explorer-view] .eaSend:disabled {
	opacity: .45;
	cursor: default;
}
[data-file-explorer-view] .eaHint {
	flex-shrink: 0;
	font-size: 10.5px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-panel] .workspaceMenuPath {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 11px;
	color: var(--dsw-alias-label-secondary, #61666b);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 440px;
}
`;
		const chromeTagId = "dsh-vscode/chrome.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(chromeTagId) + "]") === null) {
			const chromeTag = document.createElement("style");
			chromeTag.dataset.plugin = "dsh-vscode";
			chromeTag.dataset.pluginCss = chromeTagId;
			chromeTag.textContent = chromeCss;
			document.head.appendChild(chromeTag);
		}
		//#endregion
