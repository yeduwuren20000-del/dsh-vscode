		//#region lib/types/client/use-explorer-t.js
		/** Subscribe to active locale and return an explorer translate function. */
		/** Reactive `t` for file-explorer copy. */
		function useExplorerT(ctx) {
			return explorerT((0, react.useSyncExternalStore)((listener) => ctx.locale.subscribe(listener), () => ctx.locale.getSnapshot().active));
		}
		//#endregion
