		//#region lib/types/client/editor/monaco-loader.js
		/**
		* Load Monaco from jsDelivr; callers fall back to textarea on failure.
		*/
		const MONACO_CDN = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";
		/**
		* Monaco pulls ~1.5 MB of AMD modules from a CDN before the editor can mount,
		* and hitting this budget is a hard fallback: the whole editor is swapped for a
		* plain textarea. The original 12s was too tight on a slow or proxied link
		* (intermittent fallbacks were observed during testing), so allow a far more
		* forgiving budget while still failing eventually on a dead CDN.
		*/
		const LOAD_TIMEOUT_MS = 30e3;
		/**
		* Monaco's per-language worker files (`language/<lang>/<lang>Worker.js`) are AMD
		* modules, not worker entry points — importing one directly throws
		* "define is not defined". The real entry point is `base/worker/workerMain.js`,
		* which ships its own AMD loader and pulls the language module named during the
		* worker handshake.
		*
		* Two constraints shape the wiring below:
		*   1. A cross-origin worker URL is rejected outright, so the worker must be
		*      bootstrapped from a same-origin blob.
		*   2. A blob worker has no meaningful `self.location`, and workerMain falls back
		*      to the relative "../../../" when it cannot see a base URL — which would
		*      resolve against `blob:` and fail. So we hand it an explicit `baseUrl`
		*      pointing at the CDN's `min/` directory (the parent of `vs/`), matching how
		*      the AMD loader maps the `vs/...` module ids.
		*
		* Without any of this the bundled JSON / TS / CSS / HTML language services stay
		* dormant: no completion, no validation, no hover, no definition lookup — and
		* this editor only ever gets plain syntax colouring.
		*/
		const MONACO_WORKER_ENTRY = "base/worker/workerMain.js";
		function ensureMonacoEnvironment() {
			if (typeof window === "undefined" || window.MonacoEnvironment !== void 0) return;
			const baseUrl = MONACO_CDN.replace(/\/vs$/, "/");
			const source = `self.MonacoEnvironment={baseUrl:${JSON.stringify(baseUrl)}};importScripts(${JSON.stringify(`${MONACO_CDN}/${MONACO_WORKER_ENTRY}`)});`;
			let workerUrl = null;
			window.MonacoEnvironment = {
				getWorkerUrl() {
					if (workerUrl === null) workerUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
					return workerUrl;
				}
			};
		}
		/**
		* Give Monaco's bundled language services usable defaults.
		* Diagnostics are deliberately narrowed: this editor has no tsconfig and no
		* node_modules types, so unresolved-import diagnostics would paint every file
		* red and drown out the genuinely useful syntax and inference errors.
		*/
		function configureMonacoLanguages(monaco) {
			const ts = monaco.languages.typescript;
			if (ts !== void 0) {
				const compilerOptions = {
					target: ts.ScriptTarget.ESNext,
					module: ts.ModuleKind.ESNext,
					moduleResolution: ts.ModuleResolutionKind.NodeJs,
					jsx: ts.JsxEmit.ReactJSX ?? ts.JsxEmit.React,
					allowNonTsExtensions: true,
					allowJs: true,
					esModuleInterop: true,
					skipLibCheck: true,
					noEmit: true,
					strict: false
				};
				ts.typescriptDefaults.setCompilerOptions(compilerOptions);
				ts.javascriptDefaults.setCompilerOptions(compilerOptions);
				ts.typescriptDefaults.setEagerModelSync(true);
				ts.javascriptDefaults.setEagerModelSync(true);
				ts.typescriptDefaults.setDiagnosticsOptions({
					noSemanticValidation: false,
					noSyntaxValidation: false,
					diagnosticCodesToIgnore: [
						2307,
						2792,
						7016,
						2688,
						6133
					]
				});
				ts.javascriptDefaults.setDiagnosticsOptions({
					noSemanticValidation: true,
					noSyntaxValidation: false,
					diagnosticCodesToIgnore: [
						2304,
						2552
					]
				});
			}
			const json = monaco.languages.json;
			if (json !== void 0) json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				allowComments: true,
				trailingCommas: "warning",
				schemaValidation: "warning"
			});
		}
		let loading = null;
		/**
		* Ensure Monaco AMD loader + editor are available.
		*/
		function loadMonaco() {
			if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("monaco requires a browser"));
			if (window.monaco !== void 0) return Promise.resolve(window.monaco);
			if (loading !== null) return loading;
			loading = new Promise((resolve, reject) => {
				const timer = window.setTimeout(() => {
					loading = null;
					reject(/* @__PURE__ */ new Error("monaco load timed out"));
				}, LOAD_TIMEOUT_MS);
				const finish = (monaco) => {
					window.clearTimeout(timer);
					window.monaco = monaco;
					configureMonacoLanguages(monaco);
					resolve(monaco);
				};
				const startRequire = () => {
					if (window.require === void 0) {
						loading = null;
						window.clearTimeout(timer);
						reject(/* @__PURE__ */ new Error("monaco AMD loader missing"));
						return;
					}
					ensureMonacoEnvironment();
					window.require.config({ paths: { vs: MONACO_CDN } });
					window.require(["vs/editor/editor.main"], (monaco) => {
						finish(monaco);
					});
				};
				if (window.require !== void 0) {
					startRequire();
					return;
				}
				const script = document.createElement("script");
				script.src = `${MONACO_CDN}/loader.js`;
				script.async = true;
				script.onload = () => startRequire();
				script.onerror = () => {
					loading = null;
					window.clearTimeout(timer);
					reject(/* @__PURE__ */ new Error("monaco loader script failed"));
				};
				document.head.appendChild(script);
			}).catch((error) => {
				loading = null;
				throw error;
			});
			return loading;
		}
		/** Map a relative path to a Monaco language id. */
		function languageForPath(path) {
			const lower = path.toLowerCase();
			if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
			if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) return "javascript";
			if (lower.endsWith(".json")) return "json";
			if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
			if (lower.endsWith(".css") || lower.endsWith(".scss")) return "css";
			if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
			if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
			if (lower.endsWith(".py")) return "python";
			if (lower.endsWith(".go")) return "go";
			if (lower.endsWith(".rs")) return "rust";
			if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "shell";
			return "plaintext";
		}
		/**
		* Build the model URI for a workspace file.
		*
		* Monaco hands anonymous models a bare `inmemory://model/N` URI. The TS worker
		* infers a file's kind from that URI, so an extension-less one makes every `.ts`
		* file look like plain JavaScript — the editor then reports
		* "Type annotations can only be used in TypeScript files" on ordinary TypeScript.
		* Encoding the real relative path keeps each language service on the right file
		* kind (and keeps distinct files in distinct models).
		*/
		function modelUriFor(monaco, path) {
			const encoded = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
			return monaco.Uri.parse(`inmemory://file-explorer/${encoded}`);
		}
		/**
		* Language ids whose formatter ships inside the stock Monaco build. Anything
		* else needs a provider — that is the gap the LSP bridge would fill later.
		*/
		const FORMATTABLE_LANGUAGES = new Set([
			"javascript",
			"typescript",
			"json",
			"css",
			"html"
		]);
		//#endregion
