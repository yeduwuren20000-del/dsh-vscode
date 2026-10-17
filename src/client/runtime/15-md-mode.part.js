		//#region lib/types/client/state/md-mode.js
		/**
		* Per-path markdown preview vs source mode (in-memory only).
		*/
		function isMarkdownPath(path) {
			const lower = path.toLowerCase();
			return lower.endsWith(".md") || lower.endsWith(".markdown");
		}
		/**
		* Remember preview/source preference per path for the session.
		*/
		var MdModeStore = class {
			#modes = /* @__PURE__ */ new Map();
			#listeners = /* @__PURE__ */ new Set();
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			get(path) {
				return this.#modes.get(path) ?? "source";
			}
			set(path, mode) {
				this.#modes.set(path, mode);
				this.#emit();
			}
			toggle(path) {
				const next = this.get(path) === "preview" ? "source" : "preview";
				this.set(path, next);
				return next;
			}
			rename(from, to) {
				const mode = this.#modes.get(from);
				if (mode === void 0) return;
				this.#modes.delete(from);
				this.#modes.set(to, mode);
				this.#emit();
			}
			drop(path) {
				if (!this.#modes.delete(path)) return;
				this.#emit();
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		//#endregion
