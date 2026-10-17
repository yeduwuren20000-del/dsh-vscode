		//#region lib/types/client/legacy-storage.js
		/**
		* PATCH(2026-10-13): the plugin was renamed `@supanexus/dsh-plugin-file-explorer`
		* -> `dsh-vscode`.
		*
		* Carry the previous localStorage keys over exactly once, so an existing
		* install keeps its editor appearance, saved schemes, theme choice, tree
		* width and subagent-panel state instead of silently resetting to defaults.
		* Values that embed the old namespace (Monaco theme ids registered under
		* the old prefix) are rewritten inline so a saved theme selection still
		* resolves against the newly registered ids.
		*/
		const LEGACY_NAMESPACE = "supanexus-file-explorer";
		/**
		* Longest token first: the two Monaco theme ids registered under the old
		* prefix are NOT the prefix plus a suffix, so they need their own mapping
		* before the catch-all runs (`supanexus-file-explorer-vscode` would
		* otherwise degrade to `dsh-vscode-vscode` and stop resolving).
		*/
		const LEGACY_VALUE_TOKENS = [
			[`${LEGACY_NAMESPACE}-vscode`, "dsh-vscode-imported"],
			[`${LEGACY_NAMESPACE}-custom`, "dsh-vscode-custom"],
			[LEGACY_NAMESPACE, "dsh-vscode"]
		];
		const LEGACY_KEY_PAIRS = [
			[`${LEGACY_NAMESPACE}:editor-appearance`, "dsh-vscode:editor-appearance"],
			[`${LEGACY_NAMESPACE}:editor-appearance-schemes`, "dsh-vscode:editor-appearance-schemes"],
			[`${LEGACY_NAMESPACE}:theme-chosen`, "dsh-vscode:theme-chosen"],
			[`${LEGACY_NAMESPACE}:tree-width`, "dsh-vscode:tree-width"],
			[`${LEGACY_NAMESPACE}:tree-hidden`, "dsh-vscode:tree-hidden"],
			["dsh-file-explorer.subagentHeight", "dsh-vscode.subagentHeight"],
			["dsh-file-explorer.subagentActive", "dsh-vscode.subagentActive"]
		];
		/** Rewrite the theme ids a stored value may embed. */
		function rewriteLegacyValue(raw) {
			let next = raw;
			for (const [from, to] of LEGACY_VALUE_TOKENS) next = next.split(from).join(to);
			return next;
		}
		/** Copy each legacy key forward once; a present new key always wins. */
		function migrateLegacyStorage() {
			try {
				if (typeof localStorage === "undefined") return;
				for (const [legacyKey, key] of LEGACY_KEY_PAIRS) {
					if (localStorage.getItem(key) !== null) continue;
					const legacy = localStorage.getItem(legacyKey);
					if (legacy === null) continue;
					localStorage.setItem(key, rewriteLegacyValue(legacy));
				}
			} catch (error) {
				console.warn("[dsh-vscode] legacy storage migration skipped:", error);
			}
		}
		migrateLegacyStorage();
		//#endregion
