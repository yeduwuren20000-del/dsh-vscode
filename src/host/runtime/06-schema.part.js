//#region lib/types/host/settings/schema.js
/** Host settings namespace for the file explorer plugin card. */
const FILE_EXPLORER_NS = "file-explorer";
const FileExplorerSettingsSchema = z.object({
	root: z.string().default(""),
	openLinksInEditor: z.boolean().default(false)
});
//#endregion
