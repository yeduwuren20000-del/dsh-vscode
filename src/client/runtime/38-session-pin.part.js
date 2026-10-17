		//#region lib/types/client/session-pin.js
		/**
		* Keep the explorer rooted at the CURRENT SESSION's OWN folder.
		*
		* A session is the user's unit of work — a sub-workspace — so its file view
		* shows the session's files, not everything the workspace holds. The mapping
		* is durable (`<workspace>/.dsh/session-dirs.json`) and keyed by session id,
		* so two sessions sharing a title get `标题` / `标题-2` rather than a
		* collision. The workspace itself stays one click away in the picker.
		*
		* The host is handed the WORKSPACE as the anchor, never the live root:
		* once the pin applies, the root IS the session folder, so anchoring on
		* it would mint a nested family of folders on every sync.
		*
		* The session id — and its row (cwd) — come from the VIEW'S OWN PROPS, not
		* from a service walk. The host hands every `conversation.view` occupant both
		* the session id and a `useSessions` selector bound to the session list,
		* which is the only trustworthy source here: this build's `sessions.list`
		* snapshot carries `ids` / `byId` / `phase` / `projectionsBySession` and NO
		* `current` field, so a plugin reading that store cannot tell which session
		* is open — and this plugin never declares `sessions` as a dependency, so
		* `ctx.sessions` throws.
		* @param sessionId - the session this view renders, straight from slot props.
		* @param sessionCwd - that session's workspace folder, from the list row.
		* @param api - the explorer RPC facade.
		* @param reload - re-read the tree after the root moves.
		* @param onResolved - told which folder now belongs to this session (empty
		*   string when it could not be resolved, which is when the ownership
		*   strip hides) together with the session's file counts, so the panel can
		*   say what the tree is and what is in it instead of leaving the user to
		*   infer both from a path.
		* @returns a stable `holdPin()`; call it before a hand-driven root switch so
		*   the folder the user opened survives later session-list updates.
		*/
		function useSessionRootPin(sessionId, sessionCwd, sessionTitle, api, reload, onResolved) {
			/*
			 * The callback is re-created on every panel render, so it lives in a ref:
			 * listing it as an effect dependency would re-run the pin (and re-mint
			 * the folder map) on every keystroke elsewhere in the panel.
			 */
			const notify = (0, react.useRef)(onResolved);
			notify.current = onResolved;
			/* Session-scoped pin state. `hold` survives title updates but resets when
			 * the session changes, so browsing away is sticky for as long as that
			 * session is open. */
			const state = (0, react.useRef)({
				sessionId: "",
				applied: "",
				hold: false
			});
			/** Invalidates in-flight work when the session changes or we unmount. */
			const gen = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				const st = state.current;
				if (st.sessionId !== sessionId) {
					st.sessionId = sessionId;
					st.applied = "";
					st.hold = false;
					notify.current?.("");
				}
				if (typeof sessionId !== "string" || sessionId === "" || sessionCwd === "" || st.hold) return void 0;
				const mine = ++gen.current;
				void (async () => {
					/* The session folder is minted on first open and reused after that. */
					let target = sessionCwd;
					const minted = await api.resolveSessionDir(sessionId, sessionTitle, sessionCwd);
					if (minted.ok) target = minted.value.path;
					else console.warn("[dsh-vscode] session folder unavailable:", minted.error.message);
					if (mine !== gen.current || state.current.hold) return;
					notify.current?.(minted.ok ? minted.value.path : "", null);
					/*
					* Compare against what the PIN applied rather than against the live
					* root, so a folder the user opened by hand is left alone until the
					* session's own folder really changes — which in practice means the
					* moment its title arrives and the folder gets named after it.
					*/
					const key = `${sessionId}|${target}`;
					if (state.current.applied === key) return;
					state.current.applied = key;
					/*
					* Gather this session's own files into its folder BEFORE the tree
					* reads it, so the folder never paints as an empty shell and then
					* fills in a beat later. Cheap to repeat: extraction is cached
					* against the transcript's size + mtime.
					*/
					const collected = await api.sessionFiles(sessionId, sessionCwd);
					if (mine !== gen.current || state.current.hold) return;
					notify.current?.(target, collected.ok ? collected.value : null);
					const result = await api.setRoot(target);
					if (mine !== gen.current || !result.ok) return;
					reload();
					window.dispatchEvent(new CustomEvent("file-explorer:root-changed", { detail: {
						root: result.value.root,
						sessionId
					} }));
				})();
				return () => {
					gen.current++;
				};
			}, [
				sessionId,
				sessionCwd,
				sessionTitle,
				api,
				reload
			]);
			return (0, react.useCallback)(() => {
				state.current.hold = true;
			}, []);
		}
		//#endregion
