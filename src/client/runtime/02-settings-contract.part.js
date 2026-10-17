		//#region lib/types/shared/settings-contract.js
		/** Settings namespace contract visible to both Host and Client. */
		/** Must match Host settingsNamespace pattern /^[a-z][a-z0-9-]*$/ and the
		* Host cordis plugin id (`dsh-vscode`), because a plugin's settings
		* namespace IS its cordis entry config in DSH 0.2.0-rc.2. */
		const FILE_EXPLORER_SETTINGS_NS = "dsh-vscode";
		//#endregion
