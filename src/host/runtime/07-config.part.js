//#region lib/types/host/config.js
/** Cordis Config + plugin identity for the Host half. */
/** Cordis plugin id (must match cordis.patch.yml). */
const name = "dsh-vscode";
/** No required services at fiber start; settings injected nested. */
const inject = [];
const Config = z.object({
	root: z.string().default(""),
	openLinksInEditor: z.boolean().default(false).volatile()
});
//#endregion
