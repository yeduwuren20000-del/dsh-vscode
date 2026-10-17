		//#region lib/types/client/editor/appearance.js
		/**
		* Persisted Monaco / textarea appearance (theme, optional custom bg, font size, schemes).
		* Intentionally not named themeStore — keep clear of upstream naming.
		*/
		const STORAGE_KEY = "dsh-vscode:editor-appearance";
		const SCHEMES_KEY = "dsh-vscode:editor-appearance-schemes";
		/**
		* Records that the user picked a theme by hand.
		*
		* Deliberately separate from the appearance blob: font size, custom background
		* and saved schemes are unrelated concerns, and only an explicit theme choice
		* should stop the import from following the VSCode configuration.
		*/
		const THEME_CHOICE_KEY = "dsh-vscode:theme-chosen";
		const FONT_MIN = 11;
		const FONT_MAX = 24;
		const FONT_DEFAULT = 13;
		const SCHEMES_MAX = 12;
		const CUSTOM_THEME_ID = "dsh-vscode-custom";
		const THEMES = [
			"vs-dark",
			"vs",
			"hc-black"
		];
		const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
		function clampFont(size) {
			if (!Number.isFinite(size)) return FONT_DEFAULT;
			return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(size)));
		}
		function parseTheme(raw) {
			if (THEMES.includes(raw)) return raw;
			return raw === VSCODE_THEME_ID ? VSCODE_THEME_ID : "vs-dark";
		}
		/** Normalize and validate an HTML hex color; returns null when invalid. */
		function normalizeHexColor(raw) {
			const trimmed = raw.trim();
			if (!HEX_RE.test(trimmed)) return null;
			if (trimmed.length === 4) {
				const r = trimmed[1];
				const g = trimmed[2];
				const b = trimmed[3];
				return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
			}
			return trimmed.toLowerCase();
		}
		/** Color input (`#rrggbb`) value derived from a stored custom color. */
		function hexForColorInput(custom, theme) {
			if (custom !== null) {
				if (custom.length === 9) return custom.slice(0, 7);
				return custom;
			}
			if (theme === "vs") return "#ffffff";
			if (theme === "hc-black") return "#000000";
			return "#1e1e1e";
		}
		function parseCustomBackground(raw) {
			if (typeof raw !== "string") return null;
			return normalizeHexColor(raw);
		}
		function newSchemeId() {
			return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
		}
		function parseSchemes(raw) {
			if (!Array.isArray(raw)) return [];
			const out = [];
			for (const item of raw) {
				if (item === null || typeof item !== "object") continue;
				const row = item;
				const background = typeof row.background === "string" ? normalizeHexColor(row.background) : null;
				if (background === null) continue;
				const fontSize = clampFont(typeof row.fontSize === "number" ? row.fontSize : FONT_DEFAULT);
				const id = typeof row.id === "string" && row.id.length > 0 ? row.id : newSchemeId();
				out.push({
					id,
					background,
					fontSize
				});
				if (out.length >= SCHEMES_MAX) break;
			}
			return out;
		}
		function defaults() {
			return {
				theme: "vs-dark",
				customBackground: null,
				fontSize: FONT_DEFAULT,
				minimap: false,
				schemes: []
			};
		}
		function readStoredAppearance() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return {
					theme: "vs-dark",
					customBackground: null,
					fontSize: FONT_DEFAULT,
					minimap: false
				};
				const parsed = JSON.parse(raw);
				return {
					theme: parseTheme(parsed.theme),
					customBackground: parseCustomBackground(parsed.customBackground),
					fontSize: clampFont(typeof parsed.fontSize === "number" ? parsed.fontSize : FONT_DEFAULT),
					minimap: parsed.minimap === true
				};
			} catch {
				return {
					theme: "vs-dark",
					customBackground: null,
					fontSize: FONT_DEFAULT,
					minimap: false
				};
			}
		}
		function readStoredSchemes() {
			try {
				const raw = window.localStorage.getItem(SCHEMES_KEY);
				if (raw === null) return [];
				return parseSchemes(JSON.parse(raw));
			} catch {
				return [];
			}
		}
		/**
		* Mutable appearance prefs with subscribe semantics for React.
		* `getSnapshot` MUST return a stable reference between mutations.
		*/
		var EditorAppearanceStore = class {
			#theme = "vs-dark";
			#customBackground = null;
			#fontSize = FONT_DEFAULT;
			#minimap = false;
			#schemes = [];
			#hydrated = false;
			#snapshot = defaults();
			#listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			/** Load from localStorage once on the client. */
			hydrate() {
				if (this.#hydrated) return;
				this.#hydrated = true;
				if (typeof window === "undefined") return;
				const next = readStoredAppearance();
				// Migration: an appearance blob saved before theme-choice tracking
				// existed counts as a deliberate pick only when it actually moved away
				// from the defaults. A blob that merely carries a custom font size has
				// the default theme in it, so it must stay open to the VSCode import —
				// otherwise every pre-existing user would silently keep the old theme
				// and never see the one they actually use.
				if (window.localStorage.getItem(THEME_CHOICE_KEY) === null && window.localStorage.getItem(STORAGE_KEY) !== null && (next.theme !== "vs-dark" || next.customBackground !== null)) {
					try {
						window.localStorage.setItem(THEME_CHOICE_KEY, "1");
					} catch {
						/* storage unavailable */
					}
				}
				this.#theme = next.theme;
				this.#customBackground = next.customBackground;
				this.#fontSize = next.fontSize;
				this.#minimap = next.minimap;
				this.#schemes = readStoredSchemes();
				this.#refreshSnapshot();
				this.#emit();
			}
			/**
			* Whether the user ever picked a theme by hand.
			*
			* Gates the VSCode import: an import may seed and keep following the VSCode
			* theme, but must never override a deliberate choice made here.
			*/
			hasThemeChoice() {
				if (typeof window === "undefined") return false;
				return window.localStorage.getItem(THEME_CHOICE_KEY) !== null;
			}
			/**
			* Apply an imported theme.
			*
			* Unlike `setTheme` this does not record a theme choice, so the import keeps
			* tracking the VSCode configuration on subsequent loads.
			*/
			adoptTheme(theme) {
				if (this.#theme === theme && this.#customBackground === null) return;
				this.#theme = theme;
				this.#customBackground = null;
				this.#refreshSnapshot();
				this.#emit();
			}
			#rememberThemeChoice() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(THEME_CHOICE_KEY, "1");
				} catch {
					/* storage unavailable; the import simply stays free to apply */
				}
			}
			setTheme(theme) {
				if (this.#theme === theme && this.#customBackground === null) return;
				this.#theme = theme;
				this.#customBackground = null;
				this.#rememberThemeChoice();
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			/**
			* Set or clear a custom background hex.
			* @returns whether the value was accepted (invalid hex ignored when non-empty).
			*/
			setCustomBackground(raw) {
				if (raw === null || raw.trim() === "") {
					if (this.#customBackground === null) return true;
					this.#customBackground = null;
					this.#refreshSnapshot();
					this.#persistAppearance();
					this.#emit();
					return true;
				}
				const next = normalizeHexColor(raw);
				if (next === null) return false;
				if (this.#customBackground === next) return true;
				this.#customBackground = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
				return true;
			}
			setFontSize(size) {
				const next = clampFont(size);
				if (this.#fontSize === next) return;
				this.#fontSize = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			setMinimap(enabled) {
				const next = enabled === true;
				if (this.#minimap === next) return;
				this.#minimap = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			bumpFont(delta) {
				this.setFontSize(this.#fontSize + delta);
			}
			/**
			* Persist current color + font as a named scheme.
			* @param backgroundOverride optional hex (e.g. menu draft) instead of current store color.
			* @returns whether a scheme was written.
			*/
			saveScheme(backgroundOverride) {
				const background = (backgroundOverride !== void 0 ? normalizeHexColor(backgroundOverride) : null) ?? this.#customBackground ?? hexForColorInput(null, this.#theme);
				const fontSize = this.#fontSize;
				const existing = this.#schemes.findIndex((s) => s.background === background && s.fontSize === fontSize);
				if (existing >= 0) {
					const hit = this.#schemes[existing];
					this.#schemes = [hit, ...this.#schemes.filter((_, i) => i !== existing)];
					this.#refreshSnapshot();
					this.#persistSchemes();
					this.#emit();
					return true;
				}
				const next = {
					id: newSchemeId(),
					background,
					fontSize
				};
				this.#schemes = [next, ...this.#schemes].slice(0, SCHEMES_MAX);
				this.#refreshSnapshot();
				this.#persistSchemes();
				this.#emit();
				return true;
			}
			/** Apply a saved scheme (color + font). */
			applyScheme(id) {
				const scheme = this.#schemes.find((s) => s.id === id);
				if (scheme === void 0) return false;
				this.#customBackground = scheme.background;
				this.#fontSize = scheme.fontSize;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
				return true;
			}
			removeScheme(id) {
				const next = this.#schemes.filter((s) => s.id !== id);
				if (next.length === this.#schemes.length) return;
				this.#schemes = next;
				this.#refreshSnapshot();
				this.#persistSchemes();
				this.#emit();
			}
			#refreshSnapshot() {
				this.#snapshot = {
					theme: this.#theme,
					customBackground: this.#customBackground,
					fontSize: this.#fontSize,
					minimap: this.#minimap,
					schemes: this.#schemes
				};
			}
			#persistAppearance() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
						theme: this.#theme,
						customBackground: this.#customBackground,
						fontSize: this.#fontSize,
						minimap: this.#minimap
					}));
				} catch {}
			}
			#persistSchemes() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(SCHEMES_KEY, JSON.stringify(this.#schemes));
				} catch {}
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		const EDITOR_CUSTOM_THEME_ID = CUSTOM_THEME_ID;
		//#endregion
