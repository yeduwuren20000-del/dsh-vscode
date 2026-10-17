		//#region lib/types/client/state/buffers.js
		/**
		* Per-path editor buffers and dirty tracking.
		*/
		/**
		* Text buffers keyed by relative path.
		*/
		var BuffersStore = class {
			#map = /* @__PURE__ */ new Map();
			#listeners = /* @__PURE__ */ new Set();
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			get(path) {
				return this.#map.get(path);
			}
			/**
			* Load or replace buffer from a successful read. Clears dirty and stale.
			* `mtimeMs` is the disk revision this content came from; it travels back
			* with the next save so the host can reject a clobbered write.
			*/
			load(path, content, mtimeMs) {
				this.#map.set(path, {
					path,
					content,
					savedContent: content,
					mtimeMs: typeof mtimeMs === "number" ? mtimeMs : null,
					stale: false
				});
				this.#emit();
			}
			/** Update draft content; dirty when content !== savedContent. */
			setContent(path, content) {
				const prev = this.#map.get(path);
				if (prev !== void 0 && prev.content === content) return;
				if (prev === void 0) this.#map.set(path, {
					path,
					content,
					savedContent: content,
					mtimeMs: null,
					stale: false
				});
				else this.#map.set(path, {
					...prev,
					content
				});
				this.#emit();
			}
			/** Mark current content as saved (after successful write). */
			markSaved(path, mtimeMs) {
				const prev = this.#map.get(path);
				if (prev === void 0) return;
				this.#map.set(path, {
					...prev,
					savedContent: prev.content,
					mtimeMs: typeof mtimeMs === "number" ? mtimeMs : prev.mtimeMs,
					stale: false
				});
				this.#emit();
			}
			/**
			* The file moved on disk while this buffer holds unsaved edits.
			*
			* The buffer is deliberately kept — the user's work is never discarded —
			* and the editor surfaces an explicit reload instead.
			*/
			markStale(path) {
				const prev = this.#map.get(path);
				if (prev === void 0 || prev.stale === true) return;
				this.#map.set(path, {
					...prev,
					stale: true
				});
				this.#emit();
			}
			isDirty(path) {
				const entry = this.#map.get(path);
				if (entry === void 0) return false;
				return entry.content !== entry.savedContent;
			}
			drop(path) {
				if (!this.#map.delete(path)) return;
				this.#emit();
			}
			/** Move buffer after rename. */
			rename(from, to) {
				const prev = this.#map.get(from);
				if (prev === void 0) return;
				this.#map.delete(from);
				this.#map.set(to, {
					...prev,
					path: to
				});
				this.#emit();
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		//#endregion
