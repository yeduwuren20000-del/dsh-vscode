//#region lib/types/index.js
/**
* File explorer plugin — Host half.
*/
function defaultRoot() {
	return globalThis.process?.cwd?.() ?? ".";
}
/**
* Register Host filesystem RPC and settings namespace.
* @param ctx - Host plugin context.
* @param config - Cordis row configuration.
*/
function apply(ctx, config) {
	const initialRoot = config.root.trim() !== "" ? config.root : defaultRoot();
	const service = new ExplorerFsService(ctx, initialRoot);
	// DSH 0.2.0-rc.2: a plugin's settings namespace IS its cordis entry config
	// (SettingsForms.describe reads runtime Config; no settings.register API).
	// Config edits go through configEditor and reload this fiber, so the new
	// root is picked up on reload. Volatile fields (openLinksInEditor) are the
	// live-editable surface the client settings card writes to.
}
//#endregion
