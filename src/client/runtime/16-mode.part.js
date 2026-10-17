		//#region lib/types/client/state/mode.js
		/**
		* In-memory explorer mode flag (sidebar occupancy).
		* Subscribe API matches useSyncExternalStore (`() => void` listeners).
		*/
		var ExplorerModeStore = class {
			enabled = false;
			listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.enabled;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			setEnabled(next) {
				if (this.enabled === next) return;
				this.enabled = next;
				for (const listener of this.listeners) listener();
			}
			toggle() {
				this.setEnabled(!this.enabled);
				return this.enabled;
			}
		};
		//#endregion
