		//#region lib/types/client/index.js
		/**
		* Client half: Files tab fills the conversation viewArea (composer-overlay
		* contract) with a center tree | editor split. Left sidebar stays the
		* official workspace / conversation list (no sidebar.workspaces shadow).
		*/
		const PACKAGE = "dsh-vscode";
		const VIEW_ID = "file-explorer";
		/**
		* PATCH(2026-10-13): id + kind of the explorer's right-Sidebar tab.
		*
		* The explorer used to occupy the middle column (`conversation.view`), which
		* forced DSH to render the 「对话 | 文件」switcher above the conversation. Only
		* ONE occupant means no switcher, so the explorer now lives in the right
		* Sidebar instead and the middle column stays a pure native conversation.
		*/
		const SIDEBAR_TAB_KIND = "dsh-vscode";
		/** Required client services before apply runs. */
		const inject = [
			"slots",
			"remote",
			"locale",
			"connection",
			"configForms"
		];
		/**
		* Mount remotes and register UI slots.
		* @param ctx - Client root context.
		*/
		async function apply(ctx) {
			try {
				return await applyInner(ctx);
			} catch (error) {
				console.error("[dsh-vscode] apply() threw:", error, error && error.stack);
				throw error;
			}
		}
		async function applyInner(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			ctx.effect(() => disposeRemote, "dsh-vscode: remote");
			ctx.effect(() => ctx.locale.register(NS, dictionaries), "dsh-vscode: dictionaries");
			const settings = ctx.configForms.get(FILE_EXPLORER_SETTINGS_NS);
			const tabs = new TabsStore();
			const buffers = new BuffersStore();
			const mdModes = new MdModeStore();
			const mode = new ExplorerModeStore();
			ctx.inject(["remote.explorerFs"], (remoteCtx) => {
				const api = createExplorerApi(remoteCtx);
				remoteCtx.effect(() => installOpenLinksInterceptor(settings), "dsh-vscode: open-links");
				remoteCtx.effect(() => {
					let disposeComposer;
					const syncComposer = () => {
						const enabled = mode.getSnapshot();
						if (disposeComposer !== void 0) {
							try {
								disposeComposer();
							} catch (error) {
								console.error("[dsh-vscode] composer dispose failed", error);
							}
							disposeComposer = void 0;
						}
						if (!enabled) return;
						try {
							disposeComposer = remoteCtx.effect(() => remoteCtx.slots.register({
								name: "conversation.composer",
								priority: 50,
								registrant: PACKAGE,
								select: () => ({ hide: true })
							}, () => null), "dsh-vscode: composer-hide");
						} catch (error) {
							console.error("[dsh-vscode] conversation.composer register failed", error);
						}
					};
					syncComposer();
					const unsub = mode.subscribe(syncComposer);
					return () => {
						unsub();
						if (disposeComposer !== void 0) {
							try {
								disposeComposer();
							} catch {}
							disposeComposer = void 0;
						}
					};
				}, "dsh-vscode: mode→composer");
				remoteCtx.slots.inject("conversation.view", () => remoteCtx.slots.register({
					name: "conversation.view",
					id: VIEW_ID,
					order: 40,
					locale: NS,
					label: () => explorerT(remoteCtx.locale.getSnapshot().active)("viewLabel"),
					registrant: PACKAGE
				}, (props) => (0, react_jsx_runtime.jsx)(FilesView, {
					ctx: remoteCtx,
					mode,
					api,
					tabs,
					buffers,
					mdModes,
					/*
					* Forward the host's own session bindings: `sessionId` says which
					* session this occupant renders, and `useSessions` is a selector hook
					* already bound to the session list store — the plugin cannot reach
					* that store any other way (it never injects `sessions`, and this
					* build's list snapshot has no `current` field).
					*/
					sessionId: props.sessionId,
					useSessions: props.useSessions
				})));
				/**
				* The 对话 / 文件 switch that replaces the (now hidden) host tab strip.
				* Lives in the session-header utilities zone so it sits next to the other
				* per-session actions instead of eating a row above the conversation.
				*/
				remoteCtx.slots.inject("conversation.session.header.utilities", () => remoteCtx.slots.register({
					name: "conversation.session.header.utilities",
					id: SIDEBAR_TAB_KIND,
					order: 20,
					registrant: PACKAGE
				}, () => (0, react_jsx_runtime.jsx)(ConversationViewSwitch, { ctx: remoteCtx })));
				remoteCtx.slots.inject("settings.plugins.tab", () => remoteCtx.slots.register({
					name: "settings.plugins.tab",
					id: FILE_EXPLORER_SETTINGS_NS,
					order: 30,
					label: () => explorerT(remoteCtx.locale.getSnapshot().active)("settingsTitle"),
					locale: NS,
					registrant: PACKAGE
				}, (props) => (0, react_jsx_runtime.jsx)("ul", {
					style: {
						listStyle: "none",
						margin: 0,
						padding: 0,
						display: "flex",
						flexDirection: "column",
						gap: 10
					},
					children: (0, react_jsx_runtime.jsx)(ExplorerSettingsCard, {
						ctx: remoteCtx,
						scope: settings,
						...props
					})
				})));
			});
		}
		var FilesViewBoundary = class extends react.Component {
			state = { message: null };
			static getDerivedStateFromError(error) {
				return { message: error.message };
			}
			componentDidCatch(error, info) {
				console.error("[dsh-vscode] FilesView crash", error, info);
			}
			render() {
				if (this.state.message !== null) return (0, react_jsx_runtime.jsx)("div", {
					className: files_view_module_css_default.shell,
					"data-file-explorer-view": "",
					"data-conversation-composer-overlay": "",
					children: (0, react_jsx_runtime.jsx)("div", {
						className: files_view_module_css_default.crash,
						children: this.state.message
					})
				});
				return this.props.children;
			}
		};
		const TREE_WIDTH_KEY = "dsh-vscode:tree-width";
		const TREE_WIDTH_DEFAULT = 256;
		const TREE_WIDTH_MIN = 160;
		const TREE_WIDTH_MAX = 720;
		/** Whether the file column is hidden (Ctrl+B, VSCode's sidebar toggle). */
		const TREE_HIDDEN_KEY = "dsh-vscode:tree-hidden";
		/** How many quick-open hits to render — more than this is unreadable. */
		const QUICK_MAX_RESULTS = 60;
		/** Reuse the quick-open walk for this long before walking again. */
		const QUICK_CACHE_MS = 30000;
		function readTreeHidden() {
			try {
				return window.localStorage.getItem(TREE_HIDDEN_KEY) === "1";
			} catch {
				return false;
			}
		}
		function writeTreeHidden(hidden) {
			try {
				window.localStorage.setItem(TREE_HIDDEN_KEY, hidden ? "1" : "0");
			} catch {}
		}
		/**
		* Rank one file against a quick-open query, VSCode-style: subsequence
		* matching with the score weighted by WHERE the match lands.
		*
		* Typing `sed` must find `src/editor/seed.ts`, and it must rank below a
		* file actually called `seed.ts` — which is why a match in the basename
		* scores far higher than one in a parent directory, and why a match on the
		* basename's first character beats one buried mid-name. Contiguous runs
		* win too: `abc` should prefer `abc.ts` over `a-b-c.ts`.
		* @returns `null` when the query is not a subsequence of the path.
		*/
		function quickScore(rel, query) {
			/*
			 * No query: rank by how shallow the path is. Plain alphabetical order
			 * buries `lib/index.js` under `lib/types/host/session-files.js`, and
			 * the shallow files are the ones people jump to.
			 */
			if (query === "") return 1 / (rel.length + 1);
			const haystack = rel.toLowerCase();
			const needle = query.toLowerCase();
			const slash = rel.lastIndexOf("/");
			const nameStart = slash + 1;
			let score = 0;
			let hay = 0;
			let previous = -2;
			for (let n = 0; n < needle.length; n++) {
				const found = haystack.indexOf(needle[n], hay);
				if (found < 0) return null;
				const inName = found >= nameStart;
				score += inName ? 10 : 1;
				/* Contiguous with the previous character. */
				if (found === previous + 1) score += 8;
				/* Starting a path segment or a camelCase word. */
				if (found === 0 || haystack[found - 1] === "/" || haystack[found - 1] === "-" || haystack[found - 1] === "_" || haystack[found - 1] === ".") score += 6;
				else if (n > 0 && /[A-Z]/.test(rel[found])) score += 4;
				hay = found + 1;
				previous = found;
			}
			/* A hit in the basename outranks any number of directory hits. */
			if (haystack.indexOf(needle) >= nameStart) score += 40;
			/* Prefer the shorter path when scores tie: `a/b.ts` over `a/x/y/b.ts`. */
			return score - rel.length / 100;
		}
		/** Filter + rank an index. An empty query lists the shallowest paths first. */
		function quickFilter(files, query) {
			const scored = [];
			for (const file of files) {
				const score = quickScore(file.rel, query);
				if (score !== null) scored.push({
					file,
					score
				});
			}
			scored.sort((a, b) => b.score - a.score || a.file.rel.localeCompare(b.file.rel));
			return scored.slice(0, QUICK_MAX_RESULTS).map((entry) => entry.file);
		}
		/** Highlight `query` inside `rel` as [before, hit, after] triples. */
		function quickHighlight(rel, query) {
			if (query === "") return [{
				text: rel,
				hit: false
			}];
			const haystack = rel.toLowerCase();
			const needle = query.toLowerCase();
			const parts = [];
			let cursor = 0;
			for (let n = 0; n < needle.length; n++) {
				const found = haystack.indexOf(needle[n], cursor);
				if (found < 0) break;
				if (found > cursor) parts.push({
					text: rel.slice(cursor, found),
					hit: false
				});
				parts.push({
					text: rel[found],
					hit: true
				});
				cursor = found + 1;
			}
			if (cursor < rel.length) parts.push({
				text: rel.slice(cursor),
				hit: false
			});
			return parts;
		}
		/**
		* Ctrl+P — jump to a file by typing part of its name.
		*
		* Deliberately a controlled overlay rather than anything the host owns:
		* the index comes from one `listFiles` call, the ranking is local, and
		* the list is short enough (60 rows) that rendering it is free. The
		* behaviour that matters and is easy to get wrong: focus lands in the
		* input on open, arrow keys move the selection WITHOUT leaving the input
		* (so typing continues to work), and the selected row always stays
		* scrolled into view.
		*/
		function QuickOpen(props) {
			const { t, state, onPick, onClose } = props;
			const [query, setQuery] = (0, react.useState)("");
			const [active, setActive] = (0, react.useState)(0);
			const inputRef = (0, react.useRef)(null);
			const listRef = (0, react.useRef)(null);
			const results = state.files === null ? [] : quickFilter(state.files, query);
			(0, react.useEffect)(() => {
				inputRef.current?.focus();
			}, []);
			/*
			 * Reset the selection when the result set changes shape. Keeping index
			 * 5 across a query that narrows to two rows would leave Enter opening
			 * nothing.
			 */
			(0, react.useEffect)(() => {
				setActive(0);
			}, [query]);
			const activeRow = Math.min(active, Math.max(0, results.length - 1));
			(0, react.useEffect)(() => {
				const list = listRef.current;
				if (list === null) return;
				const row = list.children[activeRow];
				if (row === void 0) return;
				const top = row.offsetTop;
				const bottom = top + row.offsetHeight;
				if (top < list.scrollTop) list.scrollTop = top;
				else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
			}, [activeRow, results.length]);
			const pick = (file) => {
				if (file === void 0) return;
				onPick(file.rel);
				onClose();
			};
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose();
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					if (results.length === 0) return;
					const step = event.key === "ArrowDown" ? 1 : -1;
					setActive((current) => (current + step + results.length) % results.length);
					return;
				}
				if (event.key === "Enter") {
					event.preventDefault();
					pick(results[activeRow]);
					return;
				}
				/* Ctrl+P again cycles nothing; swallow it so the overlay stays put. */
				if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") event.preventDefault();
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: files_view_module_css_default.quickOverlay,
				"data-file-explorer-quick-open": state.files === null ? "loading" : "ready",
				onMouseDown: (event) => {
					/* A click on the backdrop dismisses; clicks inside do not. */
					if (event.target === event.currentTarget) onClose();
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: files_view_module_css_default.quickBox,
					children: [
						(0, react_jsx_runtime.jsx)("input", {
							ref: inputRef,
							className: files_view_module_css_default.quickInput,
							type: "text",
							value: query,
							placeholder: t("quickOpenPlaceholder"),
							spellCheck: false,
							autoComplete: "off",
							onChange: (event) => setQuery(event.target.value),
							onKeyDown
						}),
						state.error !== null ? (0, react_jsx_runtime.jsx)("div", {
							className: files_view_module_css_default.quickHint,
							children: state.error
						}) : (0, react_jsx_runtime.jsx)("ul", {
							ref: listRef,
							className: files_view_module_css_default.quickList,
							role: "listbox",
							children: results.map((file, index) => (0, react_jsx_runtime.jsxs)("li", {
								role: "option",
								"aria-selected": index === activeRow,
								className: index === activeRow ? `${files_view_module_css_default.quickRow} ${files_view_module_css_default.quickRowActive}` : files_view_module_css_default.quickRow,
								onMouseEnter: () => setActive(index),
								onMouseDown: (event) => {
									event.preventDefault();
									pick(file);
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: files_view_module_css_default.quickName,
									children: quickHighlight(file.name, query).map((part, partIndex) => part.hit ? (0, react_jsx_runtime.jsx)("mark", {
										className: files_view_module_css_default.quickHit,
										children: part.text
									}, partIndex) : (0, react_jsx_runtime.jsx)("span", {
										children: part.text
									}, partIndex))
								}), (0, react_jsx_runtime.jsx)("span", {
									className: files_view_module_css_default.quickDir,
									children: file.rel.includes("/") ? file.rel.slice(0, file.rel.lastIndexOf("/")) : ""
								})]
							}, file.rel))
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: files_view_module_css_default.quickHint,
							children: state.files === null ? t("quickOpenLoading") : results.length === 0 ? t("quickOpenNoMatch") : t("quickOpenCount").replace("{n}", String(results.length)).replace("{total}", String(state.total))
						})
					]
				})
			});
		}
		/**
		* How often the client asks the host what changed on disk.
		*
		* The agent writes files while the user watches, so this is the difference
		* between a live tree and a stale one. 2.5 s is a deliberate compromise:
		* the call is a tiny JSON round-trip and the host coalesces bursts, so the
		* cost is negligible next to the editor's own typing traffic.
		*/
		const WATCH_POLL_MS = 2500;
		function readTreeWidth() {
			try {
				const raw = window.localStorage.getItem(TREE_WIDTH_KEY);
				if (raw === null) return TREE_WIDTH_DEFAULT;
				const n = Number(raw);
				if (!Number.isFinite(n)) return TREE_WIDTH_DEFAULT;
				return Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, Math.round(n)));
			} catch {
				return TREE_WIDTH_DEFAULT;
			}
		}
		/**
		* Our own 对话 / 文件 switch — the replacement for the host tab strip.
		*
		* Why a proxy click instead of an API call: `selectView` belongs to
		* `ConversationSessionHeaderInjected`, which the host injects into its OWN
		* header entry. It is NOT part of the `conversation.session.header.utilities`
		* standard props (the catalog lists useResource/useChat/useInput/inputActions/
		* sessionId only), so a plugin cannot switch the middle-column view
		* programmatically. The host's tab buttons stay in the DOM — we hide only their
		* strip, via CSS — and a synthetic click on them flows through the host's own
		* handler. Active state is mirrored from the strip's `_tabActive` class with a
		* MutationObserver, so both directions stay in sync.
		*/
		function ConversationViewSwitch(props) {
			const { ctx } = props;
			const t = useExplorerT(ctx);
			const fileLabel = t("viewLabel");
			const chatLabel = t("viewChatLabel");
			const [active, setActive] = (0, react.useState)("chat");
			(0, react.useEffect)(() => {
				let frame = null;
				const read = () => {
					frame = null;
					const header = document.querySelector('[data-slot="conversation.header"]');
					if (header === null) return;
					const strip = header.querySelector('div[class*="_tabs"]');
					if (strip === null) return;
					const tabs = [...strip.querySelectorAll('button[role="tab"]')];
					const current = tabs.find((tab) => String(tab.className).includes("_tabActive"));
					if (current === undefined) return;
					const isFiles = (current.textContent || "").trim() !== chatLabel;
					setActive(isFiles ? "files" : "chat");
				};
				const schedule = () => {
					if (frame !== null) return;
					frame = window.requestAnimationFrame(read);
				};
				read();
				const observer = new MutationObserver(schedule);
				observer.observe(document.body, {
					subtree: true,
					attributes: true,
					attributeFilter: ["class"]
				});
				return () => {
					observer.disconnect();
					if (frame !== null) window.cancelAnimationFrame(frame);
				};
			}, [chatLabel]);
			const switchTo = (label) => {
				const header = document.querySelector('[data-slot="conversation.header"]');
				if (header === null) return;
				const strip = header.querySelector('div[class*="_tabs"]');
				if (strip === null) return;
				const tabs = [...strip.querySelectorAll('button[role="tab"]')];
				const target = label === "chat" ? tabs.find((tab) => (tab.textContent || "").trim() !== fileLabel) : tabs.find((tab) => (tab.textContent || "").trim() === fileLabel);
				if (target !== undefined) target.click();
			};
			const icon = (kind) => (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: kind === "chat" ? [(0, react_jsx_runtime.jsx)("path", {
					d: "M21 12a8 8 0 0 1-8 8H8l-4 3v-4.4A8 8 0 0 1 13 4a8 8 0 0 1 8 8z"
				})] : [(0, react_jsx_runtime.jsx)("path", {
					d: "M3 7.5A2.5 2.5 0 0 1 5.5 5h3.1l1.7 2h8.2A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M8.5 13h7"
				})]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "explorerViewSwitch",
				role: "group",
				"aria-label": fileLabel,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					title: chatLabel,
					"aria-label": chatLabel,
					"data-active": active === "chat" ? "true" : "false",
					onClick: () => switchTo("chat"),
					children: [icon("chat"), (0, react_jsx_runtime.jsx)("span", {
						children: chatLabel
					})]
				}), (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					title: fileLabel,
					"aria-label": fileLabel,
					"data-active": active === "files" ? "true" : "false",
					onClick: () => switchTo("files"),
					children: [icon("files"), (0, react_jsx_runtime.jsx)("span", {
						children: fileLabel
					})]
				})]
			});
		}
		//#region editor subagent panel (PATCH 2026-10-13)
		/** Expanded height of the subagent seat, remembered per browser. */
		const EA_HEIGHT_KEY = "dsh-vscode.subagentHeight";
		const EA_ACTIVE_KEY = "dsh-vscode.subagentActive";
		const EA_HEIGHT_DEFAULT = 240;
		const EA_HEIGHT_MIN = 120;
		const EA_HEIGHT_MAX = 560;
		function readEditorAgentHeight() {
			try {
				const raw = Number(window.localStorage.getItem(EA_HEIGHT_KEY));
				if (Number.isFinite(raw) && raw >= EA_HEIGHT_MIN && raw <= EA_HEIGHT_MAX) return raw;
			} catch {}
			return EA_HEIGHT_DEFAULT;
		}
		function readEditorAgentActive() {
			try {
				const raw = window.localStorage.getItem(EA_ACTIVE_KEY);
				return typeof raw === "string" && raw !== "" ? raw : null;
			} catch {
				return null;
			}
		}
		/**
		* The editor column's subagent seat.
		*
		* A subagent is a durable child assistant scoped to the open workspace. It
		* is deliberately NOT a second DSH session: the whole value of this seat is
		* that its memory is a plain workspace file, so the main agent above reads
		* it with an ordinary file read and steers it by appending to the inbox —
		* no private protocol, no second session to navigate to, and it lives
		* inside the editor the user is already looking at.
		*
		* The model always follows the open session (`modelSelection` projection),
		* passed down per call, so switching the main model switches this one too.
		*/
		function EditorAgentPanel(props) {
			const { ctx, api, sessionId } = props;
			const selectSession = props.useSessions ?? (() => void 0);
			const t = useExplorerT(ctx);
			const [open, setOpen] = (0, react.useState)(false);
			const [height, setHeight] = (0, react.useState)(readEditorAgentHeight);
			const [agents, setAgents] = (0, react.useState)([]);
			const [activeId, setActiveId] = (0, react.useState)(readEditorAgentActive);
			const [messages, setMessages] = (0, react.useState)([]);
			const [inbox, setInbox] = (0, react.useState)([]);
			const [draft, setDraft] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const scrollRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			/**
			* `useExplorerT` hands back a FRESH closure every render, so putting `t`
			* in a `useCallback` dependency list would rebuild the loader on every
			* render and make its effect re-run forever. Hold it in a ref instead:
			* the loaders stay identity-stable and read the current translations.
			*/
			const tRef = (0, react.useRef)(t);
			tRef.current = t;
			/**
			* Follow the open session's model, so switching the main model switches
			* this one too.
			*
			* `modelSelection` is a projection shaped `{ lastUsed, next }` — `next` is
			* the pair the main composer would send with, so prefer it and fall back
			* to `lastUsed`. It is read through the selector the host attaches to the
			* view props, NOT through `ctx.sessions`: this plugin never injects
			* `sessions`, and this build's list snapshot (`{ids, byId, phase,
			* projectionsBySession}`) has no `current` field to key off anyway.
			*
			* The cache keeps the snapshot identity stable across renders — returning
			* a fresh object every read would spin `useSyncExternalStore` forever.
			*/
			const modelCache = (0, react.useRef)({
				provider: "",
				model: ""
			});
			const selection = selectSession((list) => list?.byId?.[sessionId]?.projectionValues?.modelSelection);
			const picked = selection?.next ?? selection?.lastUsed;
			const sessionProvider = typeof picked?.provider === "string" ? picked.provider.trim() : "";
			const sessionModel = typeof picked?.model === "string" ? picked.model.trim() : "";
			const cached = modelCache.current;
			if (cached.provider !== sessionProvider || cached.model !== sessionModel) {
				modelCache.current = {
					provider: sessionProvider,
					model: sessionModel
				};
			}
			const model = modelCache.current;
			const loadAgents = (0, react.useCallback)(async () => {
				const result = await api.listEditorAgents();
				if (!result.ok) {
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				setError(null);
				setAgents(result.value.agents);
				/*
				* Reconcile the selection with what this root actually has.
				*
				* A remembered id can point at an agent that is gone — created while
				* the explorer was pinned to another folder, or removed outside the
				* panel. Keeping it makes the transcript load fail with a not-found
				* error on every mount, which reads like a broken feature. Fall back
				* to the newest agent instead; the tab strip only appears for two or
				* more, so without this a sole agent could never be selected at all.
				*/
				const remembered = readEditorAgentActive();
				const keep = remembered !== null && result.value.agents.some((agent) => agent.id === remembered);
				selectAgent(keep ? remembered : result.value.agents[0]?.id ?? null);
			}, [api]);
			const loadTranscript = (0, react.useCallback)(async (id) => {
				if (id === null || id === void 0) {
					setMessages([]);
					setInbox([]);
					return;
				}
				const result = await api.readEditorAgent(id);
				if (!result.ok) {
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				setError(null);
				setMessages(result.value.messages);
				setInbox(result.value.inbox);
			}, [api]);
			(0, react.useEffect)(() => {
				if (!open) return;
				void loadAgents();
			}, [open, loadAgents]);
			(0, react.useEffect)(() => {
				if (!open) return;
				void loadTranscript(activeId);
			}, [open, activeId, loadTranscript]);
			/* Switching the workspace root swaps the whole subagent set — reload. */
			(0, react.useEffect)(() => {
				const onRoot = () => {
					if (!open) return;
					void loadAgents();
					void loadTranscript(activeId);
				};
				window.addEventListener("file-explorer:root-changed", onRoot);
				return () => window.removeEventListener("file-explorer:root-changed", onRoot);
			}, [open, activeId, loadAgents, loadTranscript]);
			(0, react.useEffect)(() => {
				const node = scrollRef.current;
				if (node === null) return;
				node.scrollTop = node.scrollHeight;
			}, [messages, inbox, busy]);
			const selectAgent = (id) => {
				setActiveId(id);
				try {
					window.localStorage.setItem(EA_ACTIVE_KEY, id ?? "");
				} catch {}
			};
			const createAgent = async () => {
				setBusy(true);
				const result = await api.createEditorAgent("");
				setBusy(false);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				setAgents((list) => [result.value.agent, ...list]);
				selectAgent(result.value.agent.id);
			};
			const active = agents.find((agent) => agent.id === activeId) ?? null;
			const removeAgent = async () => {
				if (active === null) return;
				if (!window.confirm(t("subagentDeleteConfirm"))) return;
				setBusy(true);
				const result = await api.deleteEditorAgent(active.id);
				setBusy(false);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				selectAgent(null);
				setAgents((list) => list.filter((agent) => agent.id !== active.id));
			};
			const send = async () => {
				const text = draft.trim();
				if (text === "" || busy) return;
				let id = activeId;
				if (id === null) {
					const created = await api.createEditorAgent("");
					if (!created.ok) {
						setError(describeRpcError(created.error, t));
						return;
					}
					id = created.value.agent.id;
					setAgents((list) => [created.value.agent, ...list]);
					selectAgent(id);
				}
				setDraft("");
				setBusy(true);
				setError(null);
				setMessages((list) => [...list, {
					role: "user",
					content: text,
					ts: ""
				}]);
				const result = await api.sendEditorAgent(id, text, model.provider, model.model);
				setBusy(false);
				if (!result.ok) {
					/*
					* Reload FIRST and set the error after: `loadTranscript` clears the
					* error on success, so the other order would swallow the failure
					* message the user needs to see.
					*/
					await loadTranscript(id);
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				await loadTranscript(id);
				void loadAgents();
			};
			const onResizeDown = (event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				dragRef.current = {
					startY: event.clientY,
					startHeight: height
				};
			};
			const onResizeMove = (event) => {
				const drag = dragRef.current;
				if (drag === null) return;
				setHeight(Math.min(EA_HEIGHT_MAX, Math.max(EA_HEIGHT_MIN, drag.startHeight - (event.clientY - drag.startY))));
			};
			const onResizeUp = (event) => {
				if (dragRef.current === null) return;
				dragRef.current = null;
				try {
					event.currentTarget.releasePointerCapture(event.pointerId);
				} catch {}
				setHeight((value) => {
					try {
						window.localStorage.setItem(EA_HEIGHT_KEY, String(value));
					} catch {}
					return value;
				});
			};
			const activeLabel = active === null ? t("subagentTitle") : active.name;
			const iconButton = (label, glyph, onClick, disabled) => (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "eaIconBtn",
				title: label,
				"aria-label": label,
				disabled: disabled === true,
				onClick,
				children: glyph
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "eaPanel",
				"data-open": open ? "true" : "false",
				style: open ? { height } : void 0,
				children: [open ? (0, react_jsx_runtime.jsx)("div", {
					className: "eaResize",
					title: t("subagentResize"),
					onPointerDown: onResizeDown,
					onPointerMove: onResizeMove,
					onPointerUp: onResizeUp,
					onPointerCancel: onResizeUp
				}) : null, (0, react_jsx_runtime.jsxs)("div", {
					className: "eaHead",
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "eaToggle",
						"aria-expanded": open ? "true" : "false",
						onClick: () => setOpen((value) => !value),
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "eaChevron",
							children: open ? "▾" : "▸"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "eaTitle",
							children: t("subagentTitle")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "eaModel",
							title: model.model === "" ? t("subagentNoModel") : `${model.provider} · ${model.model}`,
							children: model.model === "" ? t("subagentNoModel") : model.model
						})]
					}), open ? (0, react_jsx_runtime.jsxs)("div", {
						className: "eaActions",
						children: [
							iconButton(t("subagentNew"), "＋", () => void createAgent(), false),
							iconButton(t("subagentDelete"), "🗑", () => void removeAgent(), active === null),
							iconButton(t("subagentRefresh"), "⟳", () => {
								void loadAgents();
								void loadTranscript(activeId);
							}, false)
						]
					}) : null]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: "eaBody",
					children: [agents.length > 1 ? (0, react_jsx_runtime.jsx)("div", {
						className: "eaTabs",
						children: agents.map((agent) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "eaTab",
							"data-active": agent.id === activeId ? "true" : void 0,
							title: `${agent.id} · ${agent.messageCount}`,
							onClick: () => selectAgent(agent.id),
							children: agent.name
						}, agent.id))
					}) : null, (0, react_jsx_runtime.jsxs)("div", {
						className: "eaLog",
						ref: scrollRef,
						children: [agents.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaEmpty",
							children: t("subagentEmpty")
						}) : null, agents.length > 0 && active === null ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaEmpty",
							children: t("subagentPick")
						}) : null, ...inbox.map((entry, index) => (0, react_jsx_runtime.jsxs)("div", {
							className: "eaMsg eaMsgMain",
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: "eaWho",
								children: t("subagentFromMain")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: "eaText",
								children: entry.content
							})]
						}, `inbox-${index}`)), ...messages.map((entry, index) => (0, react_jsx_runtime.jsxs)("div", {
							className: entry.role === "assistant" ? "eaMsg eaMsgAssistant" : "eaMsg eaMsgUser",
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: "eaWho",
								children: entry.role === "assistant" ? activeLabel : t("subagentYou")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: "eaText",
								children: entry.content
							})]
						}, `m-${index}`)), busy ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaMsg eaMsgAssistant",
							children: (0, react_jsx_runtime.jsx)("div", {
								className: "eaTyping",
								children: t("subagentThinking")
							})
						}) : null]
					}), error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: "eaError",
						children: error
					}) : null, (0, react_jsx_runtime.jsxs)("div", {
						className: "eaComposer",
						children: [(0, react_jsx_runtime.jsx)("textarea", {
							className: "eaInput",
							value: draft,
							rows: 2,
							placeholder: t("subagentPlaceholder"),
							onChange: (event) => setDraft(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
									event.preventDefault();
									void send();
								}
							}
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "eaSend",
							disabled: busy || draft.trim() === "",
							onClick: () => void send(),
							children: busy ? t("subagentSending") : t("subagentSend")
						})]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: "eaHint",
						children: t("subagentMemoryHint")
					})]
				}) : null]
			});
		}
		//#endregion
		/**
		* Files conversation view. The root MUST carry
		* `data-conversation-composer-overlay` so ConversationRoot stretches
		* `.viewArea`; without it the pane collapses to zero height.
		*/
		function EmptyEditorStatus({ tabs }) {
			const state = (0, react.useSyncExternalStore)(tabs.subscribe, tabs.getSnapshot);
			if (state.activePath !== null) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: "editorStatusBar",
				children: (0, react_jsx_runtime.jsx)("span", { className: "statusItem", children: "DSH" })
			});
		}
		function FilesView(props) {
			const { ctx, mode, api, tabs, buffers, mdModes, sessionId } = props;
			/**
			* The open session's list row, read through the selector the host ships
			* with the view props. Using the host's own binding is deliberate: this
			* plugin never injects `sessions`, so `ctx.sessions` throws, and this
			* build's list snapshot has no `current` field to key off anyway.
			*
			* Called unconditionally — React only cares that the call order is
			* stable, and the fallback keeps a hypothetical host without the prop
			* from crashing the view.
			*/
			const selectSession = props.useSessions ?? (() => void 0);
			const session = selectSession((list) => list?.byId?.[sessionId]);
			const sessionCwd = typeof session?.cwd === "string" ? session.cwd.trim() : "";
			const sessionTitle = typeof session?.title === "string" ? session.title.trim() : "";
			const t = useExplorerT(ctx);
			const [treeWidth, setTreeWidth] = (0, react.useState)(TREE_WIDTH_DEFAULT);
			const [treeCollapsed, setTreeCollapsed] = (0, react.useState)(readTreeHidden);
			/**
			* Quick-open state. `files === null` means "index not loaded yet" — the
			* overlay opens immediately on Ctrl+P and shows a loading line, because
			* waiting for a 20 000-entry walk before showing anything feels broken.
			*/
			const [quick, setQuick] = (0, react.useState)(null);
			/** Last completed quick-open walk, reused for QUICK_CACHE_MS. */
			const quickCache = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const [external, setExternal] = (0, react.useState)(null);
			const watchRevision = (0, react.useRef)(0);
			/**
			* Poll the host change feed and publish one `external` batch per poll.
			*
			* `paths` is the raw set for the editor (open files), `dirs` adds each
			* path's parent so an expanded directory knows to re-list. The object is
			* replaced — never mutated — so consumers re-evaluate exactly once per
			* batch via a plain effect dependency.
			*/
			(0, react.useEffect)(() => {
				let cancelled = false;
				let timer = null;
				const tick = async () => {
					const result = await api.changes(watchRevision.current).catch(() => null);
					if (cancelled) return;
					if (result !== null && result.ok) {
						watchRevision.current = result.value.revision;
						if (result.value.paths.length > 0) {
							const paths = new Set(result.value.paths);
							const dirs = new Set();
							for (const path of paths) {
								dirs.add(path);
								const slash = path.lastIndexOf("/");
								dirs.add(slash === -1 ? "" : path.slice(0, slash));
							}
							setExternal({
								paths,
								dirs
							});
						}
					}
					if (!cancelled) timer = window.setTimeout(tick, WATCH_POLL_MS);
				};
				timer = window.setTimeout(tick, WATCH_POLL_MS);
				return () => {
					cancelled = true;
					if (timer !== null) window.clearTimeout(timer);
				};
			}, [api]);
			(0, react.useLayoutEffect)(() => {
				setTreeWidth(readTreeWidth());
			}, []);
			(0, react.useLayoutEffect)(() => {
				mode.setEnabled(true);
				return () => {
					mode.setEnabled(false);
				};
			}, [mode]);
			const onResizePointerDown = (0, react.useCallback)((event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				dragRef.current = {
					startX: event.clientX,
					startWidth: treeWidth
				};
			}, [treeWidth]);
			const onResizePointerMove = (0, react.useCallback)((event) => {
				const drag = dragRef.current;
				if (drag === null) return;
				const next = Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, drag.startWidth + (event.clientX - drag.startX)));
				setTreeWidth(next);
			}, []);
			const onResizePointerUp = (0, react.useCallback)((event) => {
				if (dragRef.current === null) return;
				dragRef.current = null;
				try {
					event.currentTarget.releasePointerCapture(event.pointerId);
				} catch {}
				setTreeWidth((width) => {
					try {
						window.localStorage.setItem(TREE_WIDTH_KEY, String(width));
					} catch {}
					return width;
				});
			}, []);
			/** Double-click snaps the column back to its default width (VSCode habit). */
			const onResizeDoubleClick = (0, react.useCallback)(() => {
				setTreeWidth(TREE_WIDTH_DEFAULT);
				try {
					window.localStorage.setItem(TREE_WIDTH_KEY, String(TREE_WIDTH_DEFAULT));
				} catch {}
			}, []);
			const toggleTree = (0, react.useCallback)(() => {
				setTreeCollapsed((hidden) => {
					writeTreeHidden(!hidden);
					return !hidden;
				});
			}, []);
			/** Ctrl+Shift+E — put the caret in the tree so arrow keys work there. */
			const focusTree = (0, react.useCallback)(() => {
				setTreeCollapsed(false);
				writeTreeHidden(false);
				const root = document.querySelector("[data-file-explorer-view]");
				if (root === null) return;
				const focusRow = () => {
					const scroll = root.querySelector("[data-file-explorer-tree-scroll]");
					const row = scroll?.querySelector('[role="treeitem"][aria-selected="true"]') ?? scroll?.querySelector('[role="treeitem"]');
					if (row === void 0 || row === null) return false;
					row.focus();
					return document.activeElement === row;
				};
				if (focusRow()) return;
				const observer = new MutationObserver(() => {
					if (focusRow()) {
						observer.disconnect();
						window.clearTimeout(timeout);
					}
				});
				observer.observe(root, { childList: true, subtree: true });
				const timeout = window.setTimeout(() => {
					observer.disconnect();
					focusRow();
				}, 1500);
			}, []);
			const dropTabLocal = (0, react.useCallback)((path) => {
				tabs.close(path);
				buffers.drop(path);
				mdModes.drop(path);
			}, [
				buffers,
				mdModes,
				tabs
			]);
			/** Close the active tab, keeping the same dirty-check the ✕ uses. */
			const closeActiveTab = (0, react.useCallback)(() => {
				const active = tabs.getSnapshot().activePath;
				if (active === null) return;
				if (buffers.isDirty(active) && !window.confirm(t("confirmCloseDirty"))) return;
				dropTabLocal(active);
			}, [
				buffers,
				dropTabLocal,
				t,
				tabs
			]);
			/** Ctrl+Tab / Ctrl+PageDown cycle through open tabs, wrapping. */
			const cycleTab = (0, react.useCallback)((step) => {
				const snapshot = tabs.getSnapshot();
				const open = snapshot.open;
				if (open.length < 2) return;
				const index = open.findIndex((tab) => tab.path === snapshot.activePath);
				const next = index < 0 ? 0 : (index + step + open.length) % open.length;
				tabs.activate(open[next].path);
			}, [tabs]);
			const openQuickOpen = (0, react.useCallback)(async () => {
				const cached = quickCache.current;
				if (cached !== null && Date.now() - cached.at < QUICK_CACHE_MS) {
					setQuick({
						files: cached.files,
						total: cached.files.length,
						error: null
					});
					return;
				}
				setQuick({
					files: null,
					total: 0,
					error: null
				});
				const result = await api.listFiles("").catch(() => null);
				const next = result !== null && result.ok ? {
					files: result.value.files,
					total: result.value.files.length,
					error: null
				} : {
					files: [],
					total: 0,
					error: result === null ? t("quickOpenError") : describeRpcError(result.error, t)
				};
				if (next.files.length > 0) quickCache.current = {
					at: Date.now(),
					files: next.files
				};
				/* The overlay may have been dismissed while the walk was running. */
				setQuick((current) => current === null ? current : next);
			}, [
				api,
				t
			]);
			/**
			* VSCode muscle memory, in one place.
			*
			* Registered on `window` in the CAPTURE phase: Monaco stops propagation
			* for keys it owns, and a bubble-phase listener never sees Ctrl+P or
			* Ctrl+B once the editor has focus. Shift combinations are handled
			* first and everything else bails out on `shiftKey`, so Ctrl+Shift+F
			* (format) and Monaco's own Ctrl+Shift+* bindings stay untouched.
			*/
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if (!event.ctrlKey && !event.metaKey) return;
					const key = event.key.toLowerCase();
					if (event.shiftKey && key === "e") {
						event.preventDefault();
						focusTree();
						return;
					}
					if (event.key === "Tab" || event.key === "PageDown" || event.key === "PageUp") {
						event.preventDefault();
						const forward = event.key === "PageUp" || (event.key === "Tab" && event.shiftKey) ? -1 : 1;
						cycleTab(forward);
						return;
					}
					if (event.shiftKey || event.altKey) return;
					if (key === "b") {
						event.preventDefault();
						toggleTree();
						return;
					}
					if (key === "p") {
						event.preventDefault();
						void openQuickOpen();
						return;
					}
					if (key === "w") {
						event.preventDefault();
						closeActiveTab();
						return;
					}
					if (/^[1-9]$/.test(event.key)) {
						const open = tabs.getSnapshot().open;
						const target = open[Number(event.key) - 1];
						if (target === void 0) return;
						event.preventDefault();
						tabs.activate(target.path);
					}
				};
				window.addEventListener("keydown", onKey, true);
				return () => window.removeEventListener("keydown", onKey, true);
			}, [
				closeActiveTab,
				cycleTab,
				focusTree,
				openQuickOpen,
				tabs,
				toggleTree
			]);
			return (0, react_jsx_runtime.jsx)(FilesViewBoundary, { children: (0, react_jsx_runtime.jsx)("div", {
				className: files_view_module_css_default.shell,
				"data-file-explorer-view": "",
				"data-conversation-composer-overlay": "",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: files_view_module_css_default.filesView,
					children: [(0, react_jsx_runtime.jsxs)("nav", {
						className: "vscodeActivityBar",
						"aria-label": "编辑器活动栏",
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "vscodeActivityButton",
							"aria-label": treeCollapsed ? "显示资源管理器" : "隐藏资源管理器",
							"aria-pressed": !treeCollapsed,
							title: "资源管理器 (Ctrl+B)",
							onClick: toggleTree,
							children: (0, react_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsx)("path", { d: "M5 3.5h9l4 4v12H5z", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" }), (0, react_jsx_runtime.jsx)("path", { d: "M14 3.5v4h4M8 12h7M8 15h7", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" })]
							})
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "vscodeActivityButton",
							"aria-label": "快速打开文件",
							title: "快速打开文件 (Ctrl+P)",
							onClick: () => void openQuickOpen(),
							children: (0, react_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsx)("circle", { cx: 10.5, cy: 10.5, r: 6, stroke: "currentColor", strokeWidth: 1.6 }), (0, react_jsx_runtime.jsx)("path", { d: "m15 15 5 5", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" })]
							})
						})]
					}), treeCollapsed ? null : (0, react_jsx_runtime.jsxs)("aside", {
						className: files_view_module_css_default.treeCol,
						style: { width: treeWidth },
						"aria-label": t("treeAriaLabel"),
					children: [(0, react_jsx_runtime.jsx)(ExplorerPanel, {
						ctx,
						api,
						tabs,
						external,
						sessionId,
						sessionCwd,
						sessionTitle,
						onOpenFile: (path) => {
							requestOpenPath(path);
							if ((document.querySelector('[data-file-explorer-view]')?.clientWidth ?? Infinity) <= 720) {
								setTreeCollapsed(true);
							}
						}
					})
					]}), treeCollapsed ? null : (0, react_jsx_runtime.jsx)("div", {
						/*
						* The drag handle lives in filesView, NOT inside treeCol.
						* treeCol clips overflow, so a handle overhanging its right
						* edge by 3px could never be hit — elementFromPoint on the
						* handle's centre returned the column itself and dragging
						* was dead in BOTH directions. Positioned here by `left`
						* it tracks the column edge and actually catches the press.
						*/
						className: files_view_module_css_default.treeResize,
						role: "separator",
						"aria-orientation": "vertical",
						"aria-valuenow": treeWidth,
						"aria-valuemin": TREE_WIDTH_MIN,
						"aria-valuemax": TREE_WIDTH_MAX,
						style: { left: 44 + Math.max(TREE_WIDTH_MIN, treeWidth) - 3, right: "auto" },
						onPointerDown: onResizePointerDown,
						onPointerMove: onResizePointerMove,
						onPointerUp: onResizePointerUp,
						onPointerCancel: onResizePointerUp,
						onDoubleClick: onResizeDoubleClick
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: files_view_module_css_default.editorCol,
						children: [(0, react_jsx_runtime.jsx)(EditorSurface, {
							ctx,
							api,
							tabs,
							buffers,
							mdModes,
							external
						}), (0, react_jsx_runtime.jsx)(EditorAgentPanel, {
							ctx,
							api,
							/*
							* The subagent seat follows the session's model, so it needs the
							* same host bindings the files view got: the session id and the
							* host's own list selector (`useSessions`).
							*/
							sessionId,
							useSessions: props.useSessions
						})]
					}), (0, react_jsx_runtime.jsx)(EmptyEditorStatus, { tabs }), quick === null ? null : (0, react_jsx_runtime.jsx)(QuickOpen, {
						t,
						state: quick,
						onPick: (rel) => {
							requestOpenPath(rel);
						},
						onClose: () => {
							setQuick(null);
						}
					})]
				})
			}) });
		}
		//#endregion
