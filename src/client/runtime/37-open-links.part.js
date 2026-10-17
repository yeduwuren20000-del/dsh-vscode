		//#region lib/types/client/open-links.js
		/**
		* Capture clicks on conversation file-looking links and open them in the editor.
		*/
		const ABS_PATH = /^(?:\/|[A-Za-z]:[\\/])/;
		const REL_PATH = /^\.\.?[\\/]/;
		function candidateFromAnchor(anchor) {
			const dataPath = anchor.getAttribute("data-path") ?? anchor.getAttribute("data-filepath");
			if (dataPath !== null && dataPath.trim() !== "") return dataPath.trim();
			const href = anchor.getAttribute("href");
			if (href === null || href === "" || href.startsWith("#") || href.startsWith("mailto:")) return null;
			if (href.startsWith("file:")) try {
				return decodeURIComponent(href.replace(/^file:\/\//, "").replace(/^\/([A-Za-z]:)/, "$1"));
			} catch {
				return null;
			}
			if (ABS_PATH.test(href) || REL_PATH.test(href)) return href;
			if (!href.includes("://") && href.includes("/") && !href.startsWith("//")) return href;
			return null;
		}
		/**
		* Install a capture-phase click interceptor while settings allow it.
		* @returns disposer.
		*/
		function installOpenLinksInterceptor(scope) {
			const onClick = (event) => {
				const snap = scope.getSnapshot();
				if (snap.status !== "ready" || snap.value?.openLinksInEditor !== true) return;
				const target = event.target;
				if (!(target instanceof Element)) return;
				const anchor = target.closest("a");
				if (!(anchor instanceof HTMLAnchorElement)) return;
				const path = candidateFromAnchor(anchor);
				if (path === null) return;
				event.preventDefault();
				event.stopPropagation();
				requestOpenPath((ABS_PATH.test(path) ? path.replace(/^\/+/, "").replace(/^[A-Za-z]:[\\/]/, "") : path.replace(/^\.\//, "")).replaceAll("\\", "/"));
				window.dispatchEvent(new CustomEvent("file-explorer:focus-view"));
			};
			document.addEventListener("click", onClick, true);
			return () => document.removeEventListener("click", onClick, true);
		}
		//#endregion
