		//#region lib/types/client/rpc.js
		/**
		* Client Typert contribution + typed call helpers for `explorerFs`.
		*/
		const FailCode = enumType([
			"OUT_OF_ROOT",
			"NOT_FOUND",
			"NOT_EMPTY",
			"EXISTS",
			"IS_BINARY",
			"IS_DIR",
			"IO",
			"TOO_LARGE",
			"CONFLICT"
		]);
		const FailResultSchema = objectType({
			ok: literalType(false),
			code: FailCode,
			message: stringType()
		});
		const OkResultSchema = objectType({ ok: literalType(true) });
		const RootOkSchema = objectType({
			ok: literalType(true),
			root: stringType()
		});
		const FsEntrySchema = objectType({
			name: stringType(),
			path: stringType(),
			kind: enumType(["file", "dir"])
		});
		const ListOkSchema = objectType({
			ok: literalType(true),
			entries: arrayType(FsEntrySchema)
		});
		const ReadOkSchema = objectType({
			ok: literalType(true),
			content: stringType(),
			mtimeMs: numberType()
		});
		const WriteOkSchema = objectType({
			ok: literalType(true),
			mtimeMs: numberType()
		});
		const ChangesOkSchema = objectType({
			ok: literalType(true),
			revision: numberType(),
			paths: arrayType(stringType())
		});
		const RootResultSchema = unionType([RootOkSchema, FailResultSchema]);
		const ListResultSchema = unionType([ListOkSchema, FailResultSchema]);
		const ReadResultSchema = unionType([ReadOkSchema, FailResultSchema]);
		const WriteResultSchema = unionType([WriteOkSchema, FailResultSchema]);
		const ChangesResultSchema = unionType([ChangesOkSchema, FailResultSchema]);
		const MutateResultSchema = unionType([OkResultSchema, FailResultSchema]);
		const VscodeProfileOkSchema = objectType({
			ok: literalType(true),
			found: booleanType(),
			source: stringType(),
			profile: stringType()
		});
		const VscodeProfileResultSchema = unionType([VscodeProfileOkSchema, FailResultSchema]);
		/**
		* PATCH(2026-10-13): one durable DSH workspace, as the picker shows it.
		* `title` is the left-rail label; `path` is the folder the explorer roots
		* itself at when the entry is chosen.
		*/
		const WorkspaceEntrySchema = objectType({
			id: stringType(),
			title: stringType(),
			path: stringType()
		});
		const ListWorkspacesOkSchema = objectType({
			ok: literalType(true),
			workspaces: arrayType(WorkspaceEntrySchema)
		});
		const ListWorkspacesResultSchema = unionType([ListWorkspacesOkSchema, FailResultSchema]);
		/**
		* PATCH(2026-10-13): editor subagents. One durable child assistant per
		* workspace, whose transcript lives in the workspace as JSONL so the main
		* agent can read (and steer) it with ordinary file tools.
		*/
		const EditorAgentSchema = objectType({
			id: stringType(),
			name: stringType(),
			createdAt: stringType(),
			updatedAt: stringType(),
			messageCount: numberType()
		});
		const ListEditorAgentsOkSchema = objectType({
			ok: literalType(true),
			agents: arrayType(EditorAgentSchema)
		});
		const ListEditorAgentsResultSchema = unionType([ListEditorAgentsOkSchema, FailResultSchema]);
		const CreateEditorAgentOkSchema = objectType({
			ok: literalType(true),
			agent: EditorAgentSchema
		});
		const CreateEditorAgentResultSchema = unionType([CreateEditorAgentOkSchema, FailResultSchema]);
		const EditorAgentTurnSchema = objectType({
			role: stringType(),
			content: stringType(),
			ts: stringType()
		});
		const ReadEditorAgentOkSchema = objectType({
			ok: literalType(true),
			messages: arrayType(EditorAgentTurnSchema),
			inbox: arrayType(EditorAgentTurnSchema)
		});
		const ReadEditorAgentResultSchema = unionType([ReadEditorAgentOkSchema, FailResultSchema]);
		const SendEditorAgentOkSchema = objectType({
			ok: literalType(true),
			reply: stringType(),
			messageCount: numberType()
		});
		const SendEditorAgentResultSchema = unionType([SendEditorAgentOkSchema, FailResultSchema]);
		/**
		* PATCH(2026-10-13): per-session folders. Sessions inside one workspace all
		* share the workspace cwd, so the explorer mints one folder per session
		* (named after the session, deduplicated, mapping kept durable).
		*/
		const SessionDirOkSchema = objectType({
			ok: literalType(true),
			name: stringType(),
			path: stringType(),
			minted: booleanType()
		});
		const ResolveSessionDirResultSchema = unionType([SessionDirOkSchema, FailResultSchema]);
		const SessionDirRowSchema = objectType({
			sessionId: stringType(),
			name: stringType(),
			path: stringType()
		});
		const ListSessionDirsOkSchema = objectType({
			ok: literalType(true),
			dirs: arrayType(SessionDirRowSchema)
		});
		const ListSessionDirsResultSchema = unionType([ListSessionDirsOkSchema, FailResultSchema]);
		/**
		* PATCH(2026-10-13b): the files that belong to one session, gathered from
		* that session's own event log. Counts only — the detail lives in
		* `相关文件.md` inside the session folder, so the wire stays small even
		* for a session that read four hundred files.
		*/
		const SessionFilesOkSchema = objectType({
			ok: literalType(true),
			total: numberType(),
			produced: numberType(),
			readOnly: numberType(),
			linked: numberType(),
			missing: numberType(),
			transcript: stringType(),
			notes: arrayType(stringType())
		});
		const SessionFilesResultSchema = unionType([SessionFilesOkSchema, FailResultSchema]);
		/**
		* One entry of the quick-open index. `rel` is the path relative to the
		* index root and doubles as the display label; `name` is pre-split out
		* because every ranking rule wants it.
		*/
		const FileEntrySchema = objectType({
			rel: stringType(),
			name: stringType(),
			size: numberType(),
			mtimeMs: numberType()
		});
		const ListFilesOkSchema = objectType({
			ok: literalType(true),
			root: stringType(),
			files: arrayType(FileEntrySchema),
			truncated: booleanType()
		});
		const ListFilesResultSchema = unionType([ListFilesOkSchema, FailResultSchema]);
		const PKG = "dsh-vscode";
		const Str = stringType();
		const Num = numberType();
		function strParam(name) {
			return {
				name,
				wire: name,
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: `${PKG}/types#String`,
					create: () => Str
				}
			};
		}
		function numParam(name) {
			return {
				name,
				wire: name,
				source: "json",
				codec: {
					mode: "strict",
					typeSymbol: `${PKG}/types#Number`,
					create: () => Num
				}
			};
		}
		function resultCodec(schema, typeSymbol) {
			return {
				mode: "strict",
				typeSymbol: `${PKG}/types#${typeSymbol}`,
				create: () => schema
			};
		}
		function invocation(method, parameters, result) {
			return {
				id: `${PKG}#${EXPLORER_FS_SERVICE}/${method}`,
				service: EXPLORER_FS_SERVICE,
				namespace: EXPLORER_FS_SERVICE,
				method,
				invocation: { kind: "direct" },
				parameters,
				result
			};
		}
		/** Strict Client contribution mounted via `ctx.remote.$mount`. */
		const TYPERT_REMOTE = {
			package: PKG,
			descriptors: [
				invocation("getRoot", [], resultCodec(RootOkSchema, "RootOk")),
				invocation("listWorkspaces", [], resultCodec(ListWorkspacesResultSchema, "ListWorkspacesResult")),
				invocation("listEditorAgents", [], resultCodec(ListEditorAgentsResultSchema, "ListEditorAgentsResult")),
				invocation("createEditorAgent", [strParam("name")], resultCodec(CreateEditorAgentResultSchema, "CreateEditorAgentResult")),
				invocation("readEditorAgent", [strParam("id")], resultCodec(ReadEditorAgentResultSchema, "ReadEditorAgentResult")),
				invocation("sendEditorAgent", [strParam("id"), strParam("content"), strParam("provider"), strParam("model")], resultCodec(SendEditorAgentResultSchema, "SendEditorAgentResult")),
				invocation("deleteEditorAgent", [strParam("id")], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("resolveSessionDir", [strParam("sessionId"), strParam("title"), strParam("base")], resultCodec(ResolveSessionDirResultSchema, "ResolveSessionDirResult")),
				invocation("listSessionDirs", [strParam("base")], resultCodec(ListSessionDirsResultSchema, "ListSessionDirsResult")),
				invocation("sessionFiles", [strParam("sessionId"), strParam("base")], resultCodec(SessionFilesResultSchema, "SessionFilesResult")),
				invocation("listFiles", [strParam("root"), strParam("max")], resultCodec(ListFilesResultSchema, "ListFilesResult")),
				invocation("setRoot", [strParam("root")], resultCodec(RootResultSchema, "RootResult")),
				invocation("list", [strParam("path")], resultCodec(ListResultSchema, "ListResult")),
				invocation("read", [strParam("path")], resultCodec(ReadResultSchema, "ReadResult")),
				invocation("write", [strParam("path"), strParam("content"), numParam("expectedMtimeMs")], resultCodec(WriteResultSchema, "WriteResult")),
				invocation("changes", [numParam("since")], resultCodec(ChangesResultSchema, "ChangesResult")),
				invocation("mkdir", [strParam("path")], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("rename", [strParam("from"), strParam("to")], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("unlink", [strParam("path")], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("revealRoot", [], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("revealPath", [strParam("path")], resultCodec(MutateResultSchema, "MutateResult")),
				invocation("vscodeProfile", [], resultCodec(VscodeProfileResultSchema, "VscodeProfileResult"))
			]
		};
		async function unwrap(promise) {
			const result = await promise;
			if (!result.ok) return {
				ok: false,
				error: {
					kind: "transport",
					message: result.error.message
				}
			};
			const value = result.value;
			if (typeof value === "object" && value !== null && "ok" in value && value.ok === false) {
				const fail = value;
				return {
					ok: false,
					error: {
						kind: "business",
						message: fail.message,
						code: fail.code
					}
				};
			}
			return {
				ok: true,
				value
			};
		}
		/** Thin helpers over `ctx.remote.explorerFs` after mount. */
		function createExplorerApi(ctx) {
			const remote = () => ctx.remote.explorerFs;
			return {
				getRoot: () => unwrap(remote().getRoot()),
				listWorkspaces: () => unwrap(remote().listWorkspaces()),
				listEditorAgents: () => unwrap(remote().listEditorAgents()),
				createEditorAgent: (name) => unwrap(remote().createEditorAgent(name)),
				readEditorAgent: (id) => unwrap(remote().readEditorAgent(id)),
				sendEditorAgent: (id, content, provider, model) => unwrap(remote().sendEditorAgent(id, content, provider ?? "", model ?? "")),
				deleteEditorAgent: (id) => unwrap(remote().deleteEditorAgent(id)),
				resolveSessionDir: (sessionId, title, base) => unwrap(remote().resolveSessionDir(sessionId, title ?? "", base ?? "")),
				listSessionDirs: (base) => unwrap(remote().listSessionDirs(base ?? "")),
				sessionFiles: (sessionId, base) => unwrap(remote().sessionFiles(sessionId, base ?? "")),
				/* `max` travels as a string (the wire type for this param); "" asks
				 * the host for its default ceiling. */
				listFiles: (root) => unwrap(remote().listFiles(root ?? "", "")),
				setRoot: (root) => unwrap(remote().setRoot(root)),
				list: (path) => unwrap(remote().list(path)),
				read: (path) => unwrap(remote().read(path)),
				write: (path, content, expectedMtimeMs) => unwrap(remote().write(path, content, expectedMtimeMs)),
				mkdir: (path) => unwrap(remote().mkdir(path)),
				rename: (from, to) => unwrap(remote().rename(from, to)),
				unlink: (path) => unwrap(remote().unlink(path)),
				revealRoot: () => unwrap(remote().revealRoot()),
				revealPath: (path) => unwrap(remote().revealPath(path)),
				vscodeProfile: () => unwrap(remote().vscodeProfile()),
				changes: (since) => unwrap(remote().changes(since))
			};
		}
		//#endregion
