		//#region lib/types/client/editor/apply-monaco-appearance.js
		/**
		* Apply appearance prefs to a loaded Monaco namespace (theme + optional custom bg).
		*/
		/**
		* Register / select Monaco theme for the current appearance snapshot.
		*/
		//#region VSCode theme import
		/** Theme id registered for an imported VSCode theme. */
		const VSCODE_THEME_ID = "dsh-vscode-imported";
		/** Resolved VSCode theme, cached so registration stays idempotent. */
		let vscodeThemeDefinition = null;
		/**
		* TextMate scope -> Monaco token.
		*
		* Monaco's Monarch tokenizers emit a far coarser vocabulary than TextMate
		* grammars do, so VSCode scopes are folded onto the tokens Monaco actually
		* produces. Longest matching prefix wins (`keyword.control.flow` -> `keyword`).
		*/
		const VSCODE_SCOPE_ALIASES = [
			[
				"comment",
				"comment"
			],
			[
				"string",
				"string"
			],
			[
				"string.regexp",
				"regexp"
			],
			[
				"constant.numeric",
				"number"
			],
			[
				"constant",
				"constant"
			],
			[
				"keyword",
				"keyword"
			],
			[
				"keyword.operator",
				"operator"
			],
			[
				"storage",
				"keyword"
			],
			[
				"variable.language",
				"keyword"
			],
			[
				"variable",
				"variable"
			],
			[
				"entity.name.function",
				"identifier"
			],
			[
				"support.function",
				"identifier"
			],
			[
				"entity.name.tag",
				"tag"
			],
			[
				"entity.other.attribute-name",
				"attribute.name"
			],
			[
				"entity.name.type",
				"type"
			],
			[
				"entity.name.class",
				"type"
			],
			[
				"support.class",
				"type"
			],
			[
				"support.type",
				"type"
			],
			[
				"punctuation",
				"delimiter"
			],
			[
				"operator",
				"operator"
			],
			[
				"regexp",
				"regexp"
			],
			[
				"invalid",
				"invalid"
			]
		];
		function scopeToMonacoToken(scope) {
			const value = String(scope ?? "").trim();
			if (value === "") return null;
			let best = null;
			let bestLength = 0;
			for (const [prefix, token] of VSCODE_SCOPE_ALIASES) {
				if (value !== prefix && !value.startsWith(`${prefix}.`)) continue;
				if (prefix.length <= bestLength) continue;
				bestLength = prefix.length;
				best = token;
			}
			return best;
		}
		/** Normalise a VSCode colour to `RRGGBB` (Monaco token rules omit the hash). */
		function toTokenColor(value) {
			if (typeof value !== "string") return null;
			const hex = value.trim().replace(/^#/, "");
			if (/^[0-9a-fA-F]{8}$/.test(hex)) return hex.slice(0, 6).toLowerCase();
			if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
			if (/^[0-9a-fA-F]{3}$/.test(hex)) return hex.split("").map((c) => c + c).join("").toLowerCase();
			return null;
		}
		/** Normalise a VSCode colour to `#RRGGBB[AA]` (Monaco palettes keep the hash). */
		function toPaletteColor(value) {
			if (typeof value !== "string") return null;
			const hex = value.trim().replace(/^#/, "");
			if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) return `#${hex.toLowerCase()}`;
			if (/^[0-9a-fA-F]{3}$/.test(hex)) return `#${hex.split("").map((c) => c + c).join("").toLowerCase()}`;
			return null;
		}
		/** VSCode theme type -> Monaco base theme id. */
		function vscodeThemeBase(type) {
			const value = String(type ?? "").toLowerCase();
			if (value === "light") return "vs";
			if (value === "hclight") return "hc-light";
			if (value === "hc" || value === "hcblack" || value === "hc-black") return "hc-black";
			return "vs-dark";
		}
		/**
		* Fold a VSCode theme's `tokenColors` into Monaco rules.
		*
		* The Monaco token space is flat, so TextMate specificity has to be resolved
		* here. Scopes are staged narrow-first and generic-last: a `keyword.operator.*`
		* rule is folded onto the `operator` token, but anything that lands on a
		* generic token (say `keyword`) must not let a deep scope paint the whole
		* family. Writing the generic rule last reproduces VSCode's "more specific
		* wins, later wins ties" behaviour as closely as a flat space allows, and
		* also keeps the rule list small.
		*/
		function buildVscodeThemeRules(tokenColors) {
			const staged = [];
			for (const entry of tokenColors) {
				const settings = entry?.settings;
				if (settings === void 0) continue;
				const foreground = toTokenColor(settings.foreground);
				const fontStyle = typeof settings.fontStyle === "string" && settings.fontStyle.trim() !== "" ? settings.fontStyle.trim() : null;
				if (foreground === null && fontStyle === null) continue;
				const scopes = typeof entry.scope === "string" ? entry.scope.split(",") : Array.isArray(entry.scope) ? entry.scope : [];
				for (const rawScope of scopes) {
					const scope = String(rawScope ?? "").trim();
					if (scope === "") continue;
					const token = scopeToMonacoToken(scope);
					if (token === null) continue;
					const rule = { token };
					if (foreground !== null) rule.foreground = foreground;
					if (fontStyle !== null) rule.fontStyle = fontStyle;
					staged.push({
						depth: scope.split(".").filter(Boolean).length,
						token,
						rule
					});
				}
			}
			staged.sort((a, b) => b.depth - a.depth);
			const byToken = new Map();
			for (const item of staged) byToken.set(item.token, item.rule);
			return [...byToken.values()];
		}
		/**
		* Register the imported VSCode theme with Monaco.
		* Only editor-scoped palette keys are forwarded: a VSCode theme carries
		* workbench-wide colours that Monaco has no concept of.
		*/
		function defineVscodeTheme(monaco, theme) {
			const colors = {};
			for (const [key, value] of Object.entries(theme.colors ?? {})) {
				if (!key.startsWith("editor") && !key.startsWith("minimap") && !key.startsWith("scrollbarSlider") && !key.startsWith("editorOverviewRuler")) continue;
				const palette = toPaletteColor(value);
				if (palette !== null) colors[key] = palette;
			}
			monaco.editor.defineTheme(VSCODE_THEME_ID, {
				base: vscodeThemeBase(theme.type),
				inherit: true,
				rules: buildVscodeThemeRules(Array.isArray(theme.tokenColors) ? theme.tokenColors : []),
				colors
			});
			vscodeThemeDefinition = theme;
		}
		/**
		* Re-register the imported theme before any `setTheme` call.
		* Monaco requires a theme to be defined first, and the definition lives in
		* this module rather than in the persisted appearance, so registration has to
		* happen on every path that applies appearance.
		*/
		function ensureVscodeTheme(monaco) {
			if (vscodeThemeDefinition === null) return false;
			defineVscodeTheme(monaco, vscodeThemeDefinition);
			return true;
		}
		//#endregion
		function applyMonacoAppearance(monaco, appearance) {
			ensureVscodeTheme(monaco);
			const custom = appearance.customBackground;
			if (custom === null) {
				monaco.editor.setTheme(appearance.theme);
				return;
			}
			const base = appearance.theme === "vs" ? "vs" : appearance.theme === "hc-black" ? "hc-black" : "vs-dark";
			monaco.editor.defineTheme(EDITOR_CUSTOM_THEME_ID, {
				base,
				inherit: true,
				rules: [],
				colors: {
					"editor.background": custom,
					"editorGutter.background": custom,
					"editorLineNumber.foreground": base === "vs" ? "#237893" : "#858585"
				}
			});
			monaco.editor.setTheme(EDITOR_CUSTOM_THEME_ID);
		}
		//#endregion
