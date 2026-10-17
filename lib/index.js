import { existsSync, readFileSync, readdirSync, realpathSync, statSync, watch } from "node:fs";
import { link as linkAsync, mkdir as mkdirAsync, readdir as readdirAsync, readFile as readFileAsync, rename as renameAsync, rmdir as rmdirAsync, stat as statAsync, unlink as unlinkAsync, writeFile as writeFileAsync } from "node:fs/promises";
import { spawn } from "node:child_process";
import { basename, dirname, extname, isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { homedir, platform } from "node:os";
import { fileURLToPath } from "node:url";
import { zstdDecompressSync } from "node:zlib";
import { symbols } from "@deepseek-ai/cordis";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import z from "@deepseek-ai/schemastery";
//#region lib/types/shared/rpc-contract.js
/** Shared RPC DTOs and fail codes for `explorerFs`. */
const EXPLORER_FS_SERVICE = "explorerFs";
function fail(code, message) {
	return {
		ok: false,
		code,
		message
	};
}
//#endregion
//#region lib/types/host/content-type.js
/**
* Decide whether a path should be treated as editable text.
*/
const TEXT_EXTENSIONS = /* @__PURE__ */ new Set([
	".ts",
	".tsx",
	".js",
	".jsx",
	".mjs",
	".cjs",
	".json",
	".md",
	".markdown",
	".txt",
	".css",
	".scss",
	".less",
	".html",
	".htm",
	".xml",
	".svg",
	".yml",
	".yaml",
	".toml",
	".ini",
	".env",
	".sh",
	".bash",
	".zsh",
	".ps1",
	".py",
	".go",
	".rs",
	".java",
	".kt",
	".swift",
	".c",
	".h",
	".cpp",
	".hpp",
	".cs",
	".sql",
	".graphql",
	".vue",
	".svelte",
	".gitignore",
	".dockerignore",
	".editorconfig"
]);
/**
* Extension-based text hint (case-insensitive). Dotfiles without extension
* that match known names are treated as text.
*/
function isLikelyTextPath(filePath) {
	const base = filePath.split(/[/\\]/).pop() ?? filePath;
	if (base.startsWith(".") && !base.includes(".", 1)) return TEXT_EXTENSIONS.has(base) || base === ".gitignore" || base === ".dockerignore";
	const ext = extname(base).toLowerCase();
	if (ext === "" && !base.includes(".")) return false;
	return TEXT_EXTENSIONS.has(ext) || TEXT_EXTENSIONS.has(base);
}
/**
* Probe a buffer for a NUL byte (strong binary signal).
*/
function bufferLooksBinary(sample) {
	for (let i = 0; i < sample.length; i += 1) if (sample[i] === 0) return true;
	return false;
}
/**
* Combined decision: known text extension → text; otherwise probe sample.
*/
function isEditableText(filePath, sample) {
	if (isLikelyTextPath(filePath)) return !bufferLooksBinary(sample);
	return !bufferLooksBinary(sample) && sample.length > 0 ? !hasHighControlRatio(sample) : !bufferLooksBinary(sample);
}
function hasHighControlRatio(sample) {
	if (sample.length === 0) return false;
	let control = 0;
	for (let i = 0; i < sample.length; i += 1) {
		const b = sample[i];
		if (b < 9 || b > 13 && b < 32) control += 1;
	}
	return control / sample.length > .3;
}
//#endregion
//#region lib/types/host/path-guard.js
/**
* Resolve a relative path under a root and reject escapes.
*/
/**
* Normalize a caller-supplied relative path (no leading slash expected).
* Absolute inputs are rejected as INVALID (callers must use relative paths).
*/
function normalizeRelativeInput(input) {
	if (input === "" || input === ".") return "";
	if (isAbsolute(input)) return null;
	const normalized = normalize(input).replaceAll("\\", "/");
	if (normalized === ".") return "";
	if (normalized.startsWith("../") || normalized === "..") return null;
	return normalized.replace(/\/+$/, "");
}
/**
* Resolve `rel` under `root`. Both `resolve` and optional `realpath` results
* must remain inside root.
* @param root - absolute workspace root
* @param relInput - relative path from the client
* @param realpath - optional realpath resolver for symlink checks
*/
function guardPath(root, relInput, realpath) {
	const rootAbs = resolve(root);
	const rel = normalizeRelativeInput(relInput);
	if (rel === null) return {
		ok: false,
		reason: "INVALID"
	};
	const absolute = rel === "" ? rootAbs : resolve(rootAbs, rel);
	if (!isInsideRoot(rootAbs, absolute)) return {
		ok: false,
		reason: "OUT_OF_ROOT"
	};
	if (realpath !== void 0) {
		let real;
		try {
			real = realpath(absolute);
		} catch {
			const parent = resolve(absolute, "..");
			try {
				const parentReal = realpath(parent);
				if (!isInsideRoot(rootAbs, parentReal) && parentReal !== rootAbs) return {
					ok: false,
					reason: "OUT_OF_ROOT"
				};
			} catch {
				if (!isInsideRoot(rootAbs, parent) && parent !== rootAbs) return {
					ok: false,
					reason: "OUT_OF_ROOT"
				};
			}
			return {
				ok: true,
				absolute,
				relative: rel
			};
		}
		const rootReal = (() => {
			try {
				return realpath(rootAbs);
			} catch {
				return rootAbs;
			}
		})();
		if (!isInsideRoot(rootReal, real) && real !== rootReal) return {
			ok: false,
			reason: "OUT_OF_ROOT"
		};
	}
	return {
		ok: true,
		absolute,
		relative: rel
	};
}
/** True when `candidate` is `root` or a descendant. */
function isInsideRoot(root, candidate) {
	const rel = relative(root, candidate);
	if (rel === "") return true;
	if (isAbsolute(rel)) return false;
	if (rel === ".." || rel.startsWith(`..${sep}`) || rel.startsWith("../")) return false;
	return true;
}
//#endregion
//#region lib/types/host/fs-service.js
/**
* Host Typert service: filesystem operations constrained to a workspace root.
*
* Cordis exposes Services through a Proxy; Gateway invokes `@Remote` methods
* with that Proxy (or a shadow) as `this`. Never touch state on the raw
* receiver — unwrap via `symbols.original` first (same idea as Gateway's
* `originalOf`). Do not use JS `#` private fields.
*/
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
const SAMPLE_BYTES = 8192;
/**
* Hard ceiling for a single `read`. The file travels to the client as one JSON
* string, so an unbounded read would spike host memory and the RPC payload for
* a file nobody can meaningfully edit by hand anyway.
*/
const MAX_READ_BYTES = 8 * 1024 * 1024;
/** Coalescing window for filesystem watch events (editors emit bursts). */
const WATCH_FLUSH_MS = 120;
/** Maximum number of change entries retained for client polling. */
const WATCH_LOG_MAX = 512;
function isObject(value) {
	return typeof value === "object" && value !== null;
}
/** Unwrap Cordis Proxy / shadow to the real service instance. */
function selfOf(receiver) {
	const original = Reflect.get(receiver, symbols.original);
	return isObject(original) ? original : receiver;
}
function guardRel(self, rel) {
	return guardPath(self.root, rel, (p) => realpathSync(p));
}
function guardFail(reason) {
	if (reason === "OUT_OF_ROOT") return fail("OUT_OF_ROOT", "path escapes workspace root");
	return fail("OUT_OF_ROOT", "absolute or invalid path rejected");
}
//#region editor subagents (PATCH 2026-10-13)
/** Workspace-relative directory holding editor-subagent state. */
const EDITOR_AGENT_DIR = ".dsh/subagents";
/** Ids become file names, so keep them to a safe, predictable alphabet. */
const EDITOR_AGENT_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
/** Context budget handed to the model: the newest N transcript entries. */
const EDITOR_AGENT_MAX_MESSAGES = 40;
/**
* System prompt for one editor subagent.
*
* It states the two things a child cannot infer from the workspace: that a main
* agent owns the session above it, and that `<id>.inbox.jsonl` is the channel
* that agent uses to steer it. Both facts are what make the child *manageable*
* rather than merely local.
*/
const EDITOR_AGENT_SYSTEM = [
	"你是当前工作区里的「编辑器子智能体」，由一个主智能体（外层会话）调度。",
	"你服务于用户正在编辑的文件与目录，回答要简洁、具体、可执行。",
	"记忆与通信都通过工作区文件进行：",
	"- 你的完整对话记录保存在 .dsh/subagents/<你的 id>.jsonl（主智能体会读取它来了解你说过什么）。",
	"- 主智能体给你的指令会写进 .dsh/subagents/<你的 id>.inbox.jsonl，用户或主智能体也可能把指令直接贴在本对话里。",
	"当你看到以 [来自主智能体] 开头的消息时，那是你的上级下达的任务，优先执行。",
	"不要臆造文件内容；需要了解文件时，请让用户或主智能体提供，或基于已给出的上下文回答。"
].join("\n");
/** Absolute directory holding every subagent of one workspace root. */
function editorAgentDir(root) {
	return join(root, ".dsh", "subagents");
}
/** Absolute path of one subagent artifact (`<id>.jsonl` or `<id>.inbox.jsonl`). */
function editorAgentPath(root, id, suffix) {
	return join(editorAgentDir(root), `${id}${suffix ?? ".jsonl"}`);
}
/** Reject anything that could escape the subagent directory. */
function assertEditorAgentId(id) {
	if (typeof id !== "string" || !EDITOR_AGENT_ID.test(id)) throw new Error("invalid subagent id");
	return id;
}
/** Parse one JSONL transcript, skipping a torn trailing line. */
function parseJsonl(raw) {
	const out = [];
	for (const line of raw.split("\n")) {
		const trimmed = line.trim();
		if (trimmed === "") continue;
		try {
			out.push(JSON.parse(trimmed));
		} catch {
			/* a half-written line is not a fatal read */
		}
	}
	return out;
}
/** Read `index.json`; a missing file is an empty registry, not an error. */
async function readEditorAgentIndex(root) {
	let raw;
	try {
		raw = await readFileAsync(join(editorAgentDir(root), "index.json"), "utf8");
	} catch (error) {
		if (isNotFound(error)) return [];
		throw error;
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return [];
	}
	const agents = Array.isArray(parsed?.agents) ? parsed.agents : [];
	return agents.filter((agent) => isObject(agent) && typeof agent.id === "string" && EDITOR_AGENT_ID.test(agent.id)).map((agent) => ({
		id: agent.id,
		name: typeof agent.name === "string" && agent.name !== "" ? agent.name : agent.id,
		createdAt: typeof agent.createdAt === "string" ? agent.createdAt : "",
		updatedAt: typeof agent.updatedAt === "string" ? agent.updatedAt : "",
		messageCount: Number.isFinite(agent.messageCount) ? agent.messageCount : 0
	}));
}
/** Rewrite `index.json` (agent count is small; a full rewrite keeps it atomic). */
async function writeEditorAgentIndex(root, agents) {
	await mkdirAsync(editorAgentDir(root), { recursive: true });
	await writeFileAsync(join(editorAgentDir(root), "index.json"), `${JSON.stringify({
		version: 1,
		agents
	}, null, 2)}\n`, "utf8");
}
/**
* Resolve the host LLM service without declaring it in cordis `inject` — same
* reasoning as `listWorkspaces`: a profile with no LLM route must still load
* the explorer, and the subagent feature degrades with a readable error.
*/
function resolveLlm(ctx) {
	try {
		if (ctx.llm !== void 0) return ctx.llm;
	} catch {
		/* proxy access without inject may throw */
	}
	const reflect = ctx.reflect;
	if (reflect !== void 0 && typeof reflect.get === "function") {
		try {
			return reflect.get("llm", false);
		} catch {
			return void 0;
		}
	}
	return void 0;
}
/**
* Resolve a usable provider/model when the caller supplied none.
*
* The client normally passes the open session's projected `modelSelection`, but
* a blank session (or one whose projection has not hydrated) reads as empty. A
* hard failure there would make the subagent unusable for no good reason, so
* fall back to the first provider that actually advertises a model.
* @param llm - the host LLM service.
* @returns a provider/model pair, or undefined when nothing is routable.
*/
async function resolveFallbackModel(llm) {
	try {
		const providers = llm.listProviders();
		if (!Array.isArray(providers)) return void 0;
		for (const provider of providers) {
			const id = provider?.id;
			if (typeof id !== "string" || id === "") continue;
			let models;
			try {
				models = await llm.listModels(id);
			} catch {
				continue;
			}
			if (!Array.isArray(models) || models.length === 0) continue;
			const first = models.find((entry) => typeof entry?.id === "string" && entry.id !== "");
			if (first !== void 0) return {
				provider: id,
				model: first.id
			};
		}
	} catch {
		/* no adapter registry yet */
	}
	return void 0;
}
/**
* One provider-neutral message for `ctx.llm.stream`.
*
* Adapters read only `role` and `content` off a request message (verified in the
* pi-ai adapter), so a hand-built object is enough and keeps this plugin free of
* a compile-time dependency on `@deepseek-ai/dsh-llm`.
*/
function editorAgentMessage(role, text, provider, model) {
	const id = `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
	const content = [{ type: "text", text: String(text) }];
	if (role === "assistant") return {
		id,
		role,
		content,
		source: {
			kind: "model",
			provider,
			model
		}
	};
	return {
		id,
		role: "user",
		content,
		source: { kind: "user" }
	};
}
//#endregion
//#region per-session folders (PATCH 2026-10-13)
/** Workspace-relative file recording sessionId → folder name. */
const SESSION_DIR_MAP = ".dsh/session-dirs.json";
/** Longest folder name derived from a session title. */
const SESSION_DIR_MAX = 60;
/* Windows device names cannot be directory names, even with an extension. */
const SESSION_DIR_RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
/**
* Turn a session title into a safe single path segment.
*
* Sessions are the user's "sub-workspaces", so the folder should read like the
* session does. Everything Windows rejects in a name is folded to a space, and
* an unusable/empty result falls back to a short id so the folder still exists.
* @param title - the session's display title.
* @param sessionId - fallback identity.
* @returns a safe directory name (never empty, never reserved).
*/
function sessionDirName(title, sessionId) {
	let name = typeof title === "string" ? title : "";
	name = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim();
	name = name.replace(/[. ]+$/, "");
	if (name.length > SESSION_DIR_MAX) name = name.slice(0, SESSION_DIR_MAX).trim();
	if (name === "") name = `session-${String(sessionId).replace(/[^A-Za-z0-9]/g, "").slice(0, 8) || "dir"}`;
	if (SESSION_DIR_RESERVED.test(name)) name = `_${name}`;
	return name;
}
/** Read the session → folder map; a missing file is an empty map. */
async function readSessionDirMap(root) {
	let raw;
	try {
		raw = await readFileAsync(join(root, SESSION_DIR_MAP), "utf8");
	} catch (error) {
		if (isNotFound(error)) return {};
		throw error;
	}
	let parsed;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {};
	}
	const dirs = isObject(parsed?.dirs) ? parsed.dirs : {};
	const out = {};
	for (const [sessionId, value] of Object.entries(dirs)) {
		if (!isObject(value)) continue;
		const name = typeof value.name === "string" ? value.name.trim() : "";
		if (name === "") continue;
		out[sessionId] = {
			name,
			createdAt: typeof value.createdAt === "string" ? value.createdAt : ""
		};
	}
	return out;
}
/** Rewrite the session → folder map. */
async function writeSessionDirMap(root, map) {
	await mkdirAsync(join(root, ".dsh"), { recursive: true });
	await writeFileAsync(join(root, SESSION_DIR_MAP), `${JSON.stringify({
		version: 1,
		dirs: map
	}, null, 2)}\n`, "utf8");
}
/**
* Pick the directory that OWNS the session → folder map.
*
* This cannot just be the current explorer root. Pinning the explorer to a
* session folder moves that root INTO the session, so a later resolve would
* read `<workspace>/<session>/.dsh/session-dirs.json` and mint a second,
* nested family of folders. Callers therefore pass the workspace explicitly
* (the session cwd); it wins whenever it is a real directory, and only when
* that is unusable do we fall back to the live root.
* @param self - the service instance (carries the mutable root).
* @param explicit - caller-supplied workspace path, may be absent.
* @returns an absolute directory to anchor the map and folders in.
*/
function sessionDirBase(self, explicit) {
	if (typeof explicit === "string") {
		const wanted = explicit.trim();
		if (wanted !== "" && isAbsolute(wanted)) {
			try {
				if (statSync(wanted).isDirectory()) return realpathSync(wanted);
			} catch { /* not a directory any more — fall back to the live root */ }
		}
	}
	return self.root;
}
/** Where a session's own deliverables go. */
const SESSION_ARTIFACTS = "artifacts";
/** The file that explains a session folder to whoever opens it. */
const SESSION_README = "README.md";
/** The session's own scratch notes. */
const SESSION_NOTES = "notes.md";
/**
* The README a freshly minted session folder explains itself with.
*
* The wording matters more than it looks. A session folder sits INSIDE the
* workspace, so the obvious reading is "a copy of the workspace" — which it is
* not and must not be. Being open about that here is cheaper than explaining it
* again in chat every time the folder looks thinner than expected.
* @param meta - the session identity.
* @returns markdown text.
*/
function sessionReadmeText(meta) {
	const title = meta.title.trim() === "" ? "(未命名会话)" : meta.title.trim();
	return `# ${title}

这是**本会话自己的文件夹**，不是工作区的全部文件。

| | |
| --- | --- |
| 会话 ID | \`${meta.sessionId}\` |
| 所属工作区 | \`${meta.base}\` |
| 建立时间 | ${meta.createdAt} |

## 这里放什么

| 路径 | 说明 |
| --- | --- |
| \`${SESSION_ARTIFACTS}/\` | 本会话产出的文件：草稿、导出、报告…… |
| \`${SESSION_NOTES}\` | 本会话的笔记 |
| \`.dsh/\` | 本会话的内部数据（子智能体记忆等），一般不用手改 |

## 为什么这里不是工作区的全部文件

同一个工作区下的所有会话**共用同一个工作目录**——会话的 cwd 在建立时就固定了，
之后无法更改。所以工作区的源码不会被复制进每个会话文件夹：那是所有会话的共同底稿，
复制一份出来只会立刻过期。

需要看工作区本体时，点文件面板顶部的「工作区」跳回去。

> 一句话：**会话文件夹只装属于这个会话的东西。**
`;
}
/**
* Give a session folder a shape worth opening.
*
* An empty folder is worse than no folder: the user opens it once, sees
* nothing, and stops trusting the mapping. Seeding is idempotent and never
* overwrites — an existing README or notes file is the user's own text, and
* clobbering it on the next open would be the same bug in a louder costume.
* @param absolute - the session folder.
* @param meta - the session identity used in the README.
* @returns whether anything was created now.
*/
async function seedSessionDir(absolute, meta) {
	let created = false;
	await mkdirAsync(join(absolute, SESSION_ARTIFACTS), { recursive: true });
	if (!(await pathExists(join(absolute, SESSION_README)))) {
		await writeFileAsync(join(absolute, SESSION_README), sessionReadmeText(meta), "utf8");
		created = true;
	}
	if (!(await pathExists(join(absolute, SESSION_NOTES)))) {
		const head = meta.title.trim() === "" ? "会话笔记" : meta.title.trim();
		await writeFileAsync(join(absolute, SESSION_NOTES), `# ${head}\n\n`, "utf8");
		created = true;
	}
	return created;
}
//#endregion
//#region session related files (PATCH 2026-10-13b)
/**
 * The files that belong to ONE session.
 *
 * A session folder that holds only scaffolding still answers "which folder is
 * this?" but not the question the user actually asked — "where are the files
 * for this conversation?". Those files exist: DSH writes every tool call and
 * every presented deliverable into the session's own event log, keyed by
 * session id. This region reads that log back and puts the result where the
 * user can see it.
 *
 * Two deliberate choices worth the ink:
 *
 * - **The log is the source, not the file system.** Only the log knows which
 *   session touched a path. A directory scan cannot attribute anything, and
 *   `mtime` attribution silently credits whatever the user did in another
 *   session at the same time.
 * - **The mirror is hardlinks.** Same volume, so the entry in the session
 *   folder IS the workspace file — no copy to go stale, no snapshot to explain.
 *   The cost is an atomic-replace write by the agent (temp + rename) leaves the
 *   link pointing at the old inode; every open re-links, so the window is one
 *   session-open wide.
 */
/** Folder inside a session folder that mirrors the session's own files. */
const RELATED_DIR = "相关文件";
/** Human-readable index of the same set, written next to the mirror. */
const RELATED_INDEX = "相关文件.md";
/** Quick-open index bounds: how many files, and how deep to walk. */
const FILES_MAX = 20000;
const FILES_MAX_DEPTH = 16;
/** Extraction cache + mirror manifest, kept inside the session folder. */
const RELATED_CACHE = ".dsh/related.json";
/** Refuse to read an absurd transcript rather than block the host. */
const TRANSCRIPT_MAX_BYTES = 96 * 1024 * 1024;
/** Cap on mirror entries created in one pass. */
const RELATED_MIRROR_MAX = 300;
/** Entries never listed as "the session's files". */
const RELATED_SKIP = /(^|\/)(node_modules|\.git)(\/|$)/;
/** Prefer paths produced inside the CURRENT session folder? No: those are the
 *  session's own scaffolding, never a workspace file worth mirroring. */
/** Every zstd frame starts with this; DSH appends one frame per flush. */
const ZSTD_MAGIC = Buffer.from([
	0x28,
	0xb5,
	0x2f,
	0xfd
]);
/**
* Which argument of which tool names a file, and what that means.
*
* `pwsh` is deliberately absent: its command string merely *mentions* paths
* (`Get-ChildItem`, `Remove-Item`, a here-doc body) and attributing those would
* fill the list with noise. `grep` / `glob` are absent for the same reason —
* they name a search root, not a file the session worked on.
*/
const TOOL_FILE_ARG = {
	read: "file_path",
	read_image: "file_path",
	edit: "file_path",
	write: "file_path"
};
/** Higher wins when one file shows up in several roles. */
const RELATED_RANK = {
	read: 1,
	edited: 2,
	written: 3,
	delivered: 4
};
/**
* Shell tools, whose argument is a command string rather than a path.
*
* Excluded from `TOOL_FILE_ARG` originally, and that was the whole gap: in one
* real session 688 of 2407 tool calls (29%) were shell, and every file written
* with `Set-Content` / `Out-File` / `>` was invisible to the related-file list
* because nothing read the command text.
*/
const SHELL_TOOLS = new Set([
	"pwsh",
	"powershell",
	"bash",
	"sh",
	"cmd",
	"shell",
	"terminal"
]);
/**
* A verb that takes a file it is about to create or overwrite.
*
* `>` must not be followed by `&` or `$`, which keeps `2>&1` and `2>$null`
* (both pure-redirect noise on otherwise read-only commands) out.
*/
const SHELL_WRITE_VERB = /(Set-Content|Add-Content|Out-File|New-Item|Copy-Item|Move-Item|Rename-Item|Export-Csv|Export-Clixml|Set-ItemProperty|\btee\b|>>?(?![&$]))/i;
/** Absolute Windows path sitting in a command string. */
const SHELL_PATH_TOKEN = /[A-Za-z]:[\\/][^\s"'`|;)<>\]]+/g;
/**
* A relative path worth resolving: something with a separator AND a file
* extension. The leading lookbehind keeps it from re-matching the tail of an
* absolute path it already matched (whose `X:` prefix rules it out anyway).
*/
const SHELL_REL_TOKEN = /(?<![\w:\\/.-])([\w.$-]+(?:[\\/][\w. $-]+)*[\\/][\w.$-]*\.[A-Za-z0-9]{1,8})/g;
/** A write lands just AFTER the command causing it; allow for clock jitter. */
const SHELL_WRITE_GRACE_MS = 5000;
/** …and not much later than that, or it was somebody else writing. */
const SHELL_WRITE_WINDOW_MS = 300000;
/** Ceiling on filesystem probes for one session. */
const SHELL_VERIFY_MAX = 1000;
/** Separators normalised, trailing slashes dropped, case folded. */
function flatPath(value) {
	return toPosix(value).replace(/\/+$/, "").toLowerCase();
}
function toPosix(value) {
	return value.replaceAll("\\", "/");
}
/** `start` and each ancestor above it, nearest first. */
function ancestors(start, limit) {
	const out = [];
	let current = resolve(start);
	for (let i = 0; i < limit; i++) {
		out.push(current);
		const parent = dirname(current);
		if (parent === current) break;
		current = parent;
	}
	return out;
}
/** A session-store root contains at least one `--<encoded cwd>--` bucket. */
async function looksLikeSessionsRoot(dir) {
	try {
		const entries = await readdirAsync(dir, { withFileTypes: true });
		return entries.some((entry) => entry.isDirectory() && entry.name.startsWith("--") && entry.name.endsWith("--"));
	} catch {
		return false;
	}
}
let sessionsRootCache;
/**
* Locate DSH's session store (`<install>/data/sessions`).
*
* Nothing hands the host this path: the workspace cwd only names a *bucket*
* inside it. Walking up from anchors the host does have covers both layouts in
* the wild — a plugin linked out of a dev checkout
* (`…/DeepSeekHarness/Workspaces/<plugin>` → finds `…/DeepSeekHarness/data/sessions`)
* and one installed into a profile (`…/data/profiles/node_modules/…` → finds
* `…/data/sessions`). Anything that merely contains a folder called `sessions`
* is rejected unless it also looks like a store.
* @returns the store root, or null when it cannot be found.
*/
async function findSessionsRoot() {
	if (sessionsRootCache !== void 0) return sessionsRootCache;
	let here = "";
	try {
		here = dirname(fileURLToPath(import.meta.url));
	} catch { /* not an ESM file URL — the other anchors still apply */ }
	const anchors = [
		here,
		process.resourcesPath,
		process.cwd()
	].filter((value) => typeof value === "string" && value !== "");
	for (const anchor of anchors) {
		for (const parent of ancestors(anchor, 8)) {
			for (const candidate of [join(parent, "data", "sessions"), join(parent, "sessions")]) {
				if (existsSync(candidate) && await looksLikeSessionsRoot(candidate)) {
					sessionsRootCache = candidate;
					return candidate;
				}
			}
		}
	}
	sessionsRootCache = null;
	return null;
}
/**
* Find one session's own store directory.
*
* The bucket name is the cwd with non-ASCII escaped as `~HEX` and separators
* folded to `-`, which is far too fragile to re-derive (and version-dependent).
* The session id, by contrast, is a UUID: look *the id* up under every bucket
* instead, and the encoding stops mattering.
*/
async function locateTranscript(sessionsRoot, sessionId) {
	const stem = sessionId.replace(/^session-/, "");
	const wanted = new Set([
		sessionId,
		stem,
		`session-${stem}`
	]);
	let buckets;
	try {
		buckets = await readdirAsync(sessionsRoot, { withFileTypes: true });
	} catch {
		return null;
	}
	for (const bucket of buckets) {
		if (!bucket.isDirectory()) continue;
		let children;
		try {
			children = await readdirAsync(join(sessionsRoot, bucket.name));
		} catch {
			continue;
		}
		const match = children.find((name) => wanted.has(name));
		if (match === void 0) continue;
		const dir = join(sessionsRoot, bucket.name, match);
		let files;
		try {
			files = await readdirAsync(dir);
		} catch {
			continue;
		}
		const log = files.find((file) => file.endsWith(".jsonl.zstd")) ?? files.find((file) => file.endsWith(".jsonl"));
		if (log !== void 0) return {
			dir,
			file: join(dir, log)
		};
	}
	return null;
}
/**
* Decode an append-only zstd log.
*
* DSH writes one zstd frame per flush, so decompressing the file as a whole
* returns ONLY the first frame — for the 6 MB session this was built against
* that is 280 bytes of session header and nothing else. Splitting on the frame
* magic and decoding each frame separately recovers all of it (3824 frames →
* 30 MB of events).
* @param buffer - the raw log.
* @returns the concatenated JSONL text.
*/
function decodeZstdFrames(buffer) {
	if (buffer.length < 4) return "";
	const starts = [];
	let cursor = 0;
	for (;;) {
		const at = buffer.indexOf(ZSTD_MAGIC, cursor);
		if (at < 0) break;
		starts.push(at);
		cursor = at + 1;
	}
	if (starts.length === 0) {
		try {
			return zstdDecompressSync(buffer).toString("utf8");
		} catch {
			return "";
		}
	}
	const parts = [];
	for (let i = 0; i < starts.length; i++) {
		const end = i + 1 < starts.length ? starts[i + 1] : buffer.length;
		try {
			parts.push(zstdDecompressSync(buffer.subarray(starts[i], end)));
		} catch { /* a torn tail after a crash is expected — skip it */ }
	}
	return Buffer.concat(parts).toString("utf8");
}
/** A file's path relative to the workspace, or "" when it lives outside it. */
function relativeToBase(base, absolute, flatAbsolute) {
	const flatBase = flatPath(base);
	if (flatAbsolute === flatBase) return basename(absolute);
	if (!flatAbsolute.startsWith(`${flatBase}/`)) return "";
	return toPosix(absolute).slice(flatBase.length + 1);
}
/**
* Read the session's files out of its own event log.
*
* Two sources, in increasing order of authority:
*   - `tool/call` — read / edit / write carry the file they acted on.
*   - `deliverables/presented` — the files the session handed over, each with
*     the description it wrote. This is the richest signal (it says *why* the
*     file matters), so it outranks a plain `write` for the same path.
* @param text - decoded JSONL.
* @param base - the workspace, used to compute display-relative paths.
* @returns one record per file, produced files first.
*/
function extractSessionFiles(text, base) {
	const byPath = new Map();
	const note = (candidate, kind, description, turn) => {
		const absolute = candidate.trim().replace(/^"|"$/g, "");
		if (absolute === "" || !isAbsolute(absolute)) return;
		if (RELATED_SKIP.test(toPosix(absolute))) return;
		const flat = flatPath(absolute);
		const rank = RELATED_RANK[kind] ?? 0;
		const previous = byPath.get(flat);
		if (previous !== void 0 && previous.rank >= rank) {
			/* Keep the winner, but never lose the only description we saw. */
			if (previous.description === "" && description !== "") previous.description = description;
			return;
		}
		byPath.set(flat, {
			path: absolute,
			rel: relativeToBase(base, absolute, flat),
			kind,
			rank,
			description,
			turn
		});
	};
	let turn = 0;
	for (const line of text.split("\n")) {
		if (line.length < 8 || line.charCodeAt(0) !== 123) continue;
		let event;
		try {
			event = JSON.parse(line);
		} catch {
			continue;
		}
		const data = event.data;
		if (!isObject(data)) continue;
		if (typeof data.turn === "number") turn = data.turn;
		if (event.type === "tool/call") {
			const argName = TOOL_FILE_ARG[data.name];
			if (argName === void 0) continue;
			let args;
			try {
				args = JSON.parse(data.arguments);
			} catch {
				continue;
			}
			if (!isObject(args)) continue;
			/* `read` in the wild carries either `file_path` or `path`. */
			const value = args[argName] ?? args.file_path ?? args.path;
			if (typeof value !== "string") continue;
			note(value, data.name === "write" ? "written" : data.name === "edit" ? "edited" : "read", "", turn);
		} else if (event.type === "deliverables/presented") {
			if (!Array.isArray(data.files)) continue;
			for (const file of data.files) {
				if (!isObject(file) || typeof file.path !== "string") continue;
				note(file.path, "delivered", typeof file.description === "string" ? file.description : "", turn);
			}
		}
	}
	return [...byPath.values()].sort((a, b) => b.rank - a.rank || a.rel.localeCompare(b.rel));
}
/**
* Candidates for "this session wrote this file with a shell command".
*
* Text alone cannot answer the question — a command string *mentions* paths
* whether it reads, lists, deletes or writes them — so this only collects the
* ones that pass the text gates, and each one remembers WHEN it was named.
* `verifyShellCandidates` then settles it against the disk; the times are the
* evidence that makes that second pass precise rather than merely plausible.
* @param text - decoded JSONL.
* @param base - the workspace: display-relativises paths, and resolves relative
*   ones when a call carries no `workdir` of its own.
* @returns `{ candidates }`, each `{ path, rel, times, turn }`.
*/
function extractShellCandidates(text, base) {
	const byPath = new Map();
	let turn = 0;
	const add = (absolute, time) => {
		if (absolute === "" || !isAbsolute(absolute)) return;
		/*
		 * `https://host` matches `s://host` — and a URL, a `$var`
		 * interpolation and a glob are all things a command mentions
		 * without any file existing at the end of them.
		 */
		if (absolute.includes("://") || /[$*?]/.test(absolute)) return;
		if (RELATED_SKIP.test(toPosix(absolute))) return;
		const flat = flatPath(absolute);
		const existing = byPath.get(flat);
		if (existing !== void 0) {
			existing.times.push(time);
			if (existing.turn === 0) existing.turn = turn;
			return;
		}
		byPath.set(flat, {
			path: absolute,
			rel: relativeToBase(base, absolute, flat),
			times: [time],
			turn
		});
	};
	for (const line of text.split("\n")) {
		if (line.length < 8 || line.charCodeAt(0) !== 123) continue;
		/*
		 * Cheap pre-filter: most lines are not a shell call at all. Note
		 * `command` is matched WITHOUT its quotes — the tool arguments are a
		 * JSON string nested inside the event, so the raw text spells it
		 * `\"command\"`, not `"command"`.
		 */
		if (!line.includes("\"tool/call\"") || !line.includes("command")) continue;
		let event;
		try {
			event = JSON.parse(line);
		} catch {
			continue;
		}
		const data = event.data;
		if (!isObject(data)) continue;
		if (typeof data.turn === "number") turn = data.turn;
		if (event.type !== "tool/call" || !SHELL_TOOLS.has(data.name)) continue;
		let args;
		try {
			args = JSON.parse(data.arguments);
		} catch {
			continue;
		}
		if (!isObject(args) || typeof args.command !== "string") continue;
		const command = args.command;
		/* Gate one: a command that only reads cannot have produced a file. */
		if (!SHELL_WRITE_VERB.test(command)) continue;
		const time = typeof event.time === "number" ? event.time : 0;
		if (time === 0) continue; /* no timestamp, no way to place the write */
		for (const match of command.matchAll(SHELL_PATH_TOKEN)) {
			/* Trailing separators are the path ending, not part of it. */
			add(match[0].replace(/[\\/]+$/, "").trim(), time);
		}
		/*
		 * Relative paths only resolve against something, and the call tells us
		 * what: its own `workdir` when it has one, otherwise the workspace —
		 * commands run from the workspace root by default.
		 */
		const root = typeof args.workdir === "string" && args.workdir.trim() !== "" ? args.workdir.trim() : base;
		for (const match of command.matchAll(SHELL_REL_TOKEN)) {
			add(resolve(root, match[1]), time);
		}
	}
	return {
		candidates: [...byPath.values()]
	};
}
/**
* Second gate: settle the shell candidates against the disk.
*
* A path named in a command proves nothing — `Get-ChildItem` names the whole
* workspace, `Remove-Item` names something already gone, and a here-doc names
* whatever it happens to print. Two disk facts decide it:
*
*   1. the path is a real file right now (rules out directories, deleted
*      scratch files, and the truncated tail of a path containing spaces);
*   2. its mtime falls just AFTER one of the calls that named it — a write
*      lands moments after the command that caused it. This is what separates
*      `> report.md` from `node --test test/x.mjs`: both name a file, but only
*      the first one moves its mtime, and it moves it forward.
*
* Checking "inside the session's lifetime" instead is NOT enough: a test file
* the session edited on day one and merely ran on day three also sits inside
* the session, and would be reported as written on day three.
* @param probe - `extractShellCandidates` output.
* @returns confirmed candidates, deduplicated, in first-seen order.
*/
async function verifyShellCandidates(probe) {
	if (probe === null || probe === void 0) return [];
	const confirmed = [];
	const seen = new Set();
	for (const candidate of probe.candidates.slice(0, SHELL_VERIFY_MAX)) {
		const flat = flatPath(candidate.path);
		if (seen.has(flat)) continue;
		seen.add(flat);
		let stats;
		try {
			stats = await statAsync(candidate.path);
		} catch {
			continue; /* never existed here, or the session removed it again */
		}
		if (!stats.isFile()) continue;
		const mtime = stats.mtimeMs;
		if (!candidate.times.some((time) => mtime >= time - SHELL_WRITE_GRACE_MS && mtime <= time + SHELL_WRITE_WINDOW_MS)) continue;
		confirmed.push(candidate);
	}
	return confirmed;
}
/**
* Fold the shell-confirmed writes into the extracted set.
*
* A file reached through both paths (say `write` in one turn, a shell patch in
* the next) must not appear twice; the richer existing record wins, and only
* gains a note that a shell command touched it as well.
* @param files - `extractSessionFiles` output, possibly from the cache.
* @param confirmed - `verifyShellCandidates` output.
* @returns a new sorted array (the input is left alone).
*/
function mergeShellFiles(files, confirmed) {
	if (confirmed.length === 0) return files;
	const byPath = new Map();
	for (const entry of files) byPath.set(flatPath(entry.path), entry);
	for (const candidate of confirmed) {
		const flat = flatPath(candidate.path);
		const existing = byPath.get(flat);
		if (existing !== void 0) {
			if (existing.via === void 0) existing.via = "shell";
			continue;
		}
		byPath.set(flat, {
			path: candidate.path,
			rel: candidate.rel,
			kind: "written",
			rank: RELATED_RANK.written,
			description: "",
			turn: candidate.turn,
			via: "shell"
		});
	}
	return [...byPath.values()].sort((a, b) => b.rank - a.rank || a.rel.localeCompare(b.rel));
}
/** Where a file sits inside the mirror: workspace-relative when it can be,
*  and a flattened absolute name when it lives outside the workspace. */
function mirrorName(entry) {
	if (entry.rel !== "") return toPosix(entry.rel);
	const flat = toPosix(entry.path).replace(/^[A-Za-z]:\//, "").replace(/[/\\]/g, "_");
	return `_外部/${flat}`;
}
/** Read `.dsh/related.json`; a missing or unreadable file is `null`. */
async function readRelatedCache(sessionFolder) {
	try {
		const raw = await readFileAsync(join(sessionFolder, RELATED_CACHE), "utf8");
		const parsed = JSON.parse(raw);
		return isObject(parsed) ? parsed : null;
	} catch {
		return null;
	}
}
async function writeRelatedCache(sessionFolder, value) {
	await mkdirAsync(join(sessionFolder, ".dsh"), { recursive: true });
	await writeFileAsync(join(sessionFolder, RELATED_CACHE), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
/**
* Mirror the session's produced files into its own folder.
*
* Read-only files are deliberately NOT mirrored: a session that read 393 files
* would bury the dozen it actually produced, and "files I glanced at" is not
* what a session folder is for. They stay listed in the index instead.
* @param sessionFolder - the session's folder.
* @param files - extraction output.
* @returns mirror stats plus the set of sources that got an entry.
*/
async function mirrorRelatedFiles(sessionFolder, files) {
	const mirror = join(sessionFolder, RELATED_DIR);
	const produced = files.filter((entry) => entry.rank >= RELATED_RANK.edited).slice(0, RELATED_MIRROR_MAX);
	const cache = await readRelatedCache(sessionFolder);
	const built = isObject(cache?.built) ? cache.built : {};
	const notes = [];
	const sources = new Set();
	let linked = 0;
	let kept = 0;
	let missing = 0;
	if (produced.length === 0) return {
		mirror,
		linked: 0,
		kept: 0,
		missing: 0,
		notes,
		built: {},
		sources
	};
	await mkdirAsync(mirror, { recursive: true });
	const next = {};
	for (const entry of produced) {
		let stats;
		try {
			stats = await statAsync(entry.path);
		} catch {
			missing += 1;
			continue;
		}
		if (!stats.isFile()) {
			missing += 1;
			continue;
		}
		const stamp = `${stats.size}:${Math.round(stats.mtimeMs)}`;
		const target = join(mirror, mirrorName(entry));
		const previous = built[target];
		if (isObject(previous) && previous.stamp === stamp) {
			next[target] = previous;
			sources.add(flatPath(entry.path));
			kept += 1;
			continue;
		}
		try {
			await mkdirAsync(dirname(target), { recursive: true });
			await unlinkAsync(target).catch(() => {});
			await linkAsync(entry.path, target);
			next[target] = {
				src: entry.path,
				stamp
			};
			sources.add(flatPath(entry.path));
			linked += 1;
		} catch (error) {
			notes.push(`无法建立链接：${entry.rel === "" ? entry.path : entry.rel}（${error instanceof Error ? error.message : error}）`);
		}
	}
	/*
	 * Drop entries that left the set.
	 *
	 * Deleting a hardlink removes only THIS name — the workspace file keeps its
	 * own link — so it is safe even if the user edited the mirror entry. An
	 * mtime guard would be wrong here: the mirror shares its inode with the
	 * source, so every ordinary edit by the agent would look like "the user
	 * touched it" and nothing would ever be cleaned up.
	 *
	 * The one case that is NOT safe is a source that has since been deleted:
	 * then this link may be the last copy of that content, and it stays.
	 */
	for (const [target, meta] of Object.entries(built)) {
		if (next[target] !== void 0) continue;
		if (isObject(meta) && typeof meta.src === "string") {
			try {
				await statAsync(meta.src);
			} catch {
				continue; /* source gone — this link may be the only copy left */
			}
		}
		await unlinkAsync(target).catch(() => {});
	}
	return {
		mirror,
		linked,
		kept,
		missing,
		notes,
		built: next,
		sources
	};
}
/** How many mirror entries the manifest currently holds. */
function mirroredCount(built) {
	return Object.keys(built).length;
}
/**
* The readable half of the feature: a markdown index of the session's files,
* carrying the deliverable descriptions DSH already recorded. The mirror shows
* *what* the files are; this says *why* each one exists.
*/
function relatedIndexText(meta, files, mirrorInfo) {
	const produced = files.filter((entry) => entry.rank >= RELATED_RANK.edited);
	const readOnly = files.filter((entry) => entry.rank === RELATED_RANK.read);
	const lines = [];
	lines.push("# 本会话相关文件");
	lines.push("");
	lines.push(`由这个会话自己的运行记录自动整理 —— **${meta.title}**。`);
	lines.push("");
	lines.push("| | |");
	lines.push("| --- | --- |");
	lines.push(`| 会话 ID | \`${meta.sessionId}\` |`);
	lines.push(`| 所属工作区 | \`${meta.base}\` |`);
	lines.push(`| 产出文件 | ${produced.length} |`);
	lines.push(`| 只读参考 | ${readOnly.length} |`);
	lines.push(`| 已归入 \`${RELATED_DIR}/\` | ${mirroredCount(mirrorInfo.built)} |`);
	lines.push(`| 整理时间 | ${meta.at} |`);
	lines.push("");
	lines.push(`## 产出（本会话创建 / 修改 / 交付）`);
	lines.push("");
	if (produced.length === 0) lines.push("_这个会话还没有产出文件。_");
	else {
		lines.push("| 文件 | 说明 |");
		lines.push("| --- | --- |");
		for (const entry of produced) {
			const label = entry.rel === "" ? entry.path : entry.rel;
			const verb = entry.kind === "delivered" ? "交付" : entry.kind === "written" ? entry.via === "shell" ? "写入" : "新建" : "修改";
			const mirrored = mirrorInfo.sources.has(flatPath(entry.path));
			const cell = mirrored ? `[\`${label}\`](${toPosix(join(RELATED_DIR, mirrorName(entry)))})` : `\`${label}\``;
			const extra = mirrored ? "" : " · 未归入镜像（文件不在磁盘上或不在同一卷）";
			lines.push(`| ${cell} | ${verb}${entry.description === "" ? "" : ` · ${entry.description}`}${extra} |`);
		}
	}
	lines.push("");
	lines.push(`## 只读参考（本会话读过）`);
	lines.push("");
	if (readOnly.length === 0) lines.push("_无。_");
	else {
		lines.push(`共 ${readOnly.length} 个，仅列出前 60 个：`);
		lines.push("");
		for (const entry of readOnly.slice(0, 60)) lines.push(`- \`${entry.rel === "" ? entry.path : entry.rel}\``);
		if (readOnly.length > 60) lines.push(`- …还有 ${readOnly.length - 60} 个`);
	}
	lines.push("");
	lines.push("---");
	lines.push("");
	lines.push(`> \`${RELATED_DIR}/\` 里的条目是**硬链接**，指向工作区里的真实文件：在这里打开、编辑、保存，`);
	lines.push("> 改的就是原文件。反过来，如果对话中的改动让某个链接变得陈旧，重新打开一次这个会话就会重建。");
	lines.push(">");
	lines.push("> 这份清单来自本会话自己的记录，所以只包含**这个会话**碰过的文件，不是整个工作区。");
	lines.push(">");
	lines.push("> 标着「写入」的条目是通过 shell 命令（`Set-Content` / `Out-File` / `>` 等）写出的：命令文本只提供线索，");
	lines.push("> 是否收录由此文件在**本会话运行期间**被改动过（mtime 落在会话时间窗内）决定。");
	lines.push("");
	return lines.join("\n");
}
//#endregion
/**
* Workspace change feed.
*
* The typert transport is request/response only — the host cannot push — so the
* client polls `changes(since)` and this module keeps a small ring buffer of
* paths touched since a given revision.
*
* This exists because the plugin lives inside an agent host: the agent rewrites
* files constantly while the user is looking at the tree, and without a feed
* both the tree and every open editor go stale with no indication.
*/
let watchRoot = null;
let watcherHandle = null;
let watchRevision = 0;
let watchEntries = [];
const watchPending = new Map();
let watchFlushTimer = null;
/** Paths that must never wake the client: they churn constantly and are hidden. */
function isNoisyWatchPath(rel) {
	for (const segment of rel.split("/")) {
		if (segment === "node_modules" || segment === ".git") return true;
	}
	return false;
}
function flushWatchEvents() {
	watchFlushTimer = null;
	if (watchPending.size === 0) return;
	for (const path of watchPending.keys()) {
		watchRevision += 1;
		watchEntries.push({
			path,
			rev: watchRevision
		});
	}
	watchPending.clear();
	if (watchEntries.length > WATCH_LOG_MAX) watchEntries = watchEntries.slice(-WATCH_LOG_MAX);
}
function recordWatchEvent(rel) {
	watchPending.set(rel, true);
	if (watchFlushTimer !== null) return;
	watchFlushTimer = setTimeout(flushWatchEvents, WATCH_FLUSH_MS);
	// Never hold the host process open just for a pending coalesce window.
	watchFlushTimer.unref?.();
}
function stopWatching() {
	if (watcherHandle !== null) {
		try {
			watcherHandle.close();
		} catch {}
		watcherHandle = null;
	}
	watchRoot = null;
}
/** (Re)start the watcher when the service root moves or on first use. */
function ensureWatching(root) {
	if (watchRoot === root && watcherHandle !== null) return;
	stopWatching();
	watchEntries = [];
	watchPending.clear();
	try {
		watcherHandle = watch(root, {
			recursive: true,
			persistent: false
		}, (_eventType, filename) => {
			if (typeof filename !== "string" || filename === "") return;
			const rel = filename.replaceAll("\\", "/");
			if (isNoisyWatchPath(rel)) return;
			recordWatchEvent(rel);
		});
		watchRoot = root;
	} catch {
		// Recursive watching is unavailable (or the root vanished); the client
		// simply keeps its manual refresh button. Never break the RPC for this.
		watcherHandle = null;
		watchRoot = null;
	}
}
/** Entries newer than `since`, de-duplicated, in insertion order. */
function changesSince(since) {
	flushWatchEvents();
	const from = typeof since === "number" && Number.isFinite(since) && since > 0 ? since : 0;
	const seen = new Set();
	const paths = [];
	for (const entry of watchEntries) {
		if (entry.rev <= from || seen.has(entry.path)) continue;
		seen.add(entry.path);
		paths.push(entry.path);
	}
	return {
		revision: watchRevision,
		paths
	};
}
/**
* Live explorer filesystem RPC. Root can be updated via `setRoot` or settings.
*/
let ExplorerFsService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _getRoot_decorators;
	let _setRoot_decorators;
	let _list_decorators;
	let _read_decorators;
	let _write_decorators;
	let _mkdir_decorators;
	let _rename_decorators;
	let _unlink_decorators;
	let _revealRoot_decorators;
	let _revealPath_decorators;
	let _vscodeProfile_decorators;
	let _changes_decorators;
	let _listWorkspaces_decorators;
	let _listEditorAgents_decorators;
	let _createEditorAgent_decorators;
	let _readEditorAgent_decorators;
	let _sendEditorAgent_decorators;
	let _deleteEditorAgent_decorators;
	let _resolveSessionDir_decorators;
	let _listSessionDirs_decorators;
	let _sessionFiles_decorators;
	let _listFiles_decorators;
	return class ExplorerFsService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_getRoot_decorators = [Remote];
			_setRoot_decorators = [Remote];
			_list_decorators = [Remote];
			_read_decorators = [Remote];
			_write_decorators = [Remote];
			_mkdir_decorators = [Remote];
			_rename_decorators = [Remote];
			_unlink_decorators = [Remote];
			_revealRoot_decorators = [Remote];
			_revealPath_decorators = [Remote];
			_vscodeProfile_decorators = [Remote];
			_changes_decorators = [Remote];
			_listWorkspaces_decorators = [Remote];
			_listEditorAgents_decorators = [Remote];
			_createEditorAgent_decorators = [Remote];
			_readEditorAgent_decorators = [Remote];
			_sendEditorAgent_decorators = [Remote];
			_deleteEditorAgent_decorators = [Remote];
			_resolveSessionDir_decorators = [Remote];
			_listSessionDirs_decorators = [Remote];
			_sessionFiles_decorators = [Remote];
			_listFiles_decorators = [Remote];
			__esDecorate(this, null, _getRoot_decorators, {
				kind: "method",
				name: "getRoot",
				static: false,
				private: false,
				access: {
					has: (obj) => "getRoot" in obj,
					get: (obj) => obj.getRoot
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _setRoot_decorators, {
				kind: "method",
				name: "setRoot",
				static: false,
				private: false,
				access: {
					has: (obj) => "setRoot" in obj,
					get: (obj) => obj.setRoot
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _list_decorators, {
				kind: "method",
				name: "list",
				static: false,
				private: false,
				access: {
					has: (obj) => "list" in obj,
					get: (obj) => obj.list
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _read_decorators, {
				kind: "method",
				name: "read",
				static: false,
				private: false,
				access: {
					has: (obj) => "read" in obj,
					get: (obj) => obj.read
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _write_decorators, {
				kind: "method",
				name: "write",
				static: false,
				private: false,
				access: {
					has: (obj) => "write" in obj,
					get: (obj) => obj.write
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _mkdir_decorators, {
				kind: "method",
				name: "mkdir",
				static: false,
				private: false,
				access: {
					has: (obj) => "mkdir" in obj,
					get: (obj) => obj.mkdir
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rename_decorators, {
				kind: "method",
				name: "rename",
				static: false,
				private: false,
				access: {
					has: (obj) => "rename" in obj,
					get: (obj) => obj.rename
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _unlink_decorators, {
				kind: "method",
				name: "unlink",
				static: false,
				private: false,
				access: {
					has: (obj) => "unlink" in obj,
					get: (obj) => obj.unlink
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _revealRoot_decorators, {
				kind: "method",
				name: "revealRoot",
				static: false,
				private: false,
				access: {
					has: (obj) => "revealRoot" in obj,
					get: (obj) => obj.revealRoot
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _revealPath_decorators, {
				kind: "method",
				name: "revealPath",
				static: false,
				private: false,
				access: {
					has: (obj) => "revealPath" in obj,
					get: (obj) => obj.revealPath
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _vscodeProfile_decorators, {
				kind: "method",
				name: "vscodeProfile",
				static: false,
				private: false,
				access: {
					has: (obj) => "vscodeProfile" in obj,
					get: (obj) => obj.vscodeProfile
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _changes_decorators, {
				kind: "method",
				name: "changes",
				static: false,
				private: false,
				access: {
					has: (obj) => "changes" in obj,
					get: (obj) => obj.changes
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listWorkspaces_decorators, {
				kind: "method",
				name: "listWorkspaces",
				static: false,
				private: false,
				access: {
					has: (obj) => "listWorkspaces" in obj,
					get: (obj) => obj.listWorkspaces
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listEditorAgents_decorators, {
				kind: "method",
				name: "listEditorAgents",
				static: false,
				private: false,
				access: {
					has: (obj) => "listEditorAgents" in obj,
					get: (obj) => obj.listEditorAgents
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _createEditorAgent_decorators, {
				kind: "method",
				name: "createEditorAgent",
				static: false,
				private: false,
				access: {
					has: (obj) => "createEditorAgent" in obj,
					get: (obj) => obj.createEditorAgent
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _readEditorAgent_decorators, {
				kind: "method",
				name: "readEditorAgent",
				static: false,
				private: false,
				access: {
					has: (obj) => "readEditorAgent" in obj,
					get: (obj) => obj.readEditorAgent
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _sendEditorAgent_decorators, {
				kind: "method",
				name: "sendEditorAgent",
				static: false,
				private: false,
				access: {
					has: (obj) => "sendEditorAgent" in obj,
					get: (obj) => obj.sendEditorAgent
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _deleteEditorAgent_decorators, {
				kind: "method",
				name: "deleteEditorAgent",
				static: false,
				private: false,
				access: {
					has: (obj) => "deleteEditorAgent" in obj,
					get: (obj) => obj.deleteEditorAgent
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _resolveSessionDir_decorators, {
				kind: "method",
				name: "resolveSessionDir",
				static: false,
				private: false,
				access: {
					has: (obj) => "resolveSessionDir" in obj,
					get: (obj) => obj.resolveSessionDir
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listSessionDirs_decorators, {
				kind: "method",
				name: "listSessionDirs",
				static: false,
				private: false,
				access: {
					has: (obj) => "listSessionDirs" in obj,
					get: (obj) => obj.listSessionDirs
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _sessionFiles_decorators, {
				kind: "method",
				name: "sessionFiles",
				static: false,
				private: false,
				access: {
					has: (obj) => "sessionFiles" in obj,
					get: (obj) => obj.sessionFiles
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _listFiles_decorators, {
				kind: "method",
				name: "listFiles",
				static: false,
				private: false,
				access: {
					has: (obj) => "listFiles" in obj,
					get: (obj) => obj.listFiles
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		/** Absolute workspace root (public: Cordis Proxy must read/write freely). */
		root = __runInitializers(this, _instanceExtraInitializers);
		/** Whether the current root was pinned from a session cwd. */
		pinned = false;
		constructor(ctx, initialRoot) {
			super(ctx, EXPLORER_FS_SERVICE);
			this.root = initialRoot;
		}
		/** Absolute root currently in effect. */
		getRootPath() {
			return this.root;
		}
		/** Whether the current root was pinned from a session cwd. */
		isPinned() {
			return this.pinned;
		}
		/**
		* Apply a settings-driven root only when not session-pinned.
		*/
		applySettingsRoot(root) {
			if (this.pinned) return;
			if (root.trim() === "") return;
			this.root = root;
		}
		/** Clear pin and fall back to the given settings root. */
		clearPin(fallbackRoot) {
			this.pinned = false;
			if (fallbackRoot.trim() !== "") this.root = fallbackRoot;
		}
		async getRoot() {
			return {
				ok: true,
				root: selfOf(this).root
			};
		}
		/**
		* PATCH(2026-10-13): every durable workspace the host knows about, so the
		* explorer's picker can offer one entry per left-rail workspace instead of
		* guessing from the loaded session set.
		*
		* `ctx.workspaceRegistry` is a sibling Core service (`@deepseek-ai/dsh-workspace`).
		* It is absent when the host profile does not load the workspace bundle, so
		* the read is optional and degrades to an empty list; the client then falls
		* back to session cwds. Entries come back in the registry's durable order,
		* which is the same order the left rail renders.
		*/
		async listWorkspaces() {
			const self = selfOf(this);
			try {
				/*
				* Resolve the registry WITHOUT adding it to this plugin's cordis
				* `inject` list. A hard inject would make the whole explorer fail to
				* activate on any profile that does not ship the workspace bundle —
				* too high a price for a picker. `ctx.reflect.get(name, false)` is
				* the documented read-without-inject path and returns undefined
				* instead of throwing when the service is absent.
				*/
				let registry;
				try {
					registry = self.ctx.workspaceRegistry;
				} catch {
					registry = void 0;
				}
				if (registry === void 0) {
					const reflect = self.ctx.reflect;
					if (reflect !== void 0 && typeof reflect.get === "function") registry = reflect.get("workspaceRegistry", false);
				}
				if (registry === void 0) return {
					ok: true,
					workspaces: []
				};
				const workspaces = [];
				for (const entity of registry.list()) {
					const path = typeof entity.path === "string" ? entity.path : "";
					if (path === "") continue;
					workspaces.push({
						id: String(entity.id),
						title: typeof entity.title === "string" && entity.title !== "" ? entity.title : path,
						path
					});
				}
				return {
					ok: true,
					workspaces
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot read the workspace registry");
			}
		}
		/**
		* Every editor subagent of the current root, newest first.
		* @returns the durable registry rows.
		*/
		async listEditorAgents() {
			try {
				return {
					ok: true,
					agents: await readEditorAgentIndex(selfOf(this).root)
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot read subagents");
			}
		}
		/**
		* Register one new editor subagent and give it an empty transcript.
		* @param name - display name; a default is derived when blank.
		* @returns the created row.
		*/
		async createEditorAgent(name) {
			const self = selfOf(this);
			try {
				const agents = await readEditorAgentIndex(self.root);
				const id = `sa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
				const now = new Date().toISOString();
				const agent = {
					id,
					name: typeof name === "string" && name.trim() !== "" ? name.trim().slice(0, 60) : `子智能体 ${agents.length + 1}`,
					createdAt: now,
					updatedAt: now,
					messageCount: 0
				};
				await mkdirAsync(editorAgentDir(self.root), { recursive: true });
				await writeFileAsync(editorAgentPath(self.root, id), "", "utf8");
				await writeEditorAgentIndex(self.root, [agent, ...agents]);
				return {
					ok: true,
					agent
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot create subagent");
			}
		}
		/**
		* One subagent's transcript plus the instructions the main agent wrote into
		* its inbox. Both are plain JSONL files, which is exactly why the main agent
		* can read this child's memory with an ordinary file read.
		* @param id - subagent id.
		* @returns transcript entries and inbox entries.
		*/
		async readEditorAgent(id) {
			const self = selfOf(this);
			try {
				assertEditorAgentId(id);
				/*
				* Project each entry down to the three wire fields the strict client
				* codec declares. The transcript file keeps provider/model/ts verbatim
				* — this is only the RPC shape, never the stored record.
				*/
				const read = async (suffix) => {
					let entries;
					try {
						entries = parseJsonl(await readFileAsync(editorAgentPath(self.root, id, suffix), "utf8"));
					} catch (error) {
						if (isNotFound(error)) return [];
						throw error;
					}
					return entries.filter((entry) => isObject(entry)).map((entry) => ({
						role: entry.role === "assistant" ? "assistant" : "user",
						content: typeof entry.content === "string" ? entry.content : "",
						ts: typeof entry.ts === "string" ? entry.ts : ""
					}));
				};
				return {
					ok: true,
					messages: await read(void 0),
					inbox: await read(".inbox.jsonl")
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot read subagent");
			}
		}
		/**
		* Append one user turn and answer it with the host LLM service.
		*
		* `provider`/`model` come from the caller (the client reads them off the
		* session's `modelSelection` projection), which is how the subagent
		* "follows the main session's model" without the host having to guess.
		* Both turns are persisted BEFORE the reply is returned, so a failed or
		* abandoned call still leaves the memory file consistent.
		* @param id - subagent id.
		* @param content - the user's message text.
		* @param provider - model provider route.
		* @param model - provider model id.
		* @returns the persisted turns and the assistant reply text.
		*/
		async sendEditorAgent(id, content, provider, model) {
			const self = selfOf(this);
			try {
				assertEditorAgentId(id);
				const text = typeof content === "string" ? content.trim() : "";
				if (text === "") return fail("IO", "message is empty");
				const llm = resolveLlm(self.ctx);
				if (llm === void 0 || typeof llm.stream !== "function") return fail("IO", "LLM 服务不可用：请先在设置里配置一个模型供应商");
				/*
				* The caller passes the open session's projected model so the child
				* follows the main model. When it arrives empty (blank session, or a
				* projection that has not hydrated yet) fall back to the first
				* routable provider rather than failing the whole turn.
				*/
				let useProvider = typeof provider === "string" ? provider.trim() : "";
				let useModel = typeof model === "string" ? model.trim() : "";
				if (useProvider === "" || useModel === "") {
					const fallback = await resolveFallbackModel(llm);
					if (fallback === void 0) return fail("IO", "没有可用的模型：请先在设置里配置一个模型供应商");
					if (useProvider === "") useProvider = fallback.provider;
					if (useModel === "") useModel = fallback.model;
				}
				const transcriptFile = editorAgentPath(self.root, id);
				let history;
				try {
					history = parseJsonl(await readFileAsync(transcriptFile, "utf8"));
				} catch (error) {
					if (isNotFound(error)) return fail("NOT_FOUND", "subagent not found");
					throw error;
				}
				const now = () => new Date().toISOString();
				const userEntry = {
					role: "user",
					content: text,
					ts: now()
				};
				history.push(userEntry);
				/*
				* Build the request model-side view: the system prompt, then the newest
				* window of the transcript. Assistant turns keep their producing
				* provider/model so an adapter that owns both routes may replay them.
				*/
				const messages = [editorAgentMessage("system", EDITOR_AGENT_SYSTEM)];
				for (const entry of history.slice(-EDITOR_AGENT_MAX_MESSAGES)) {
					const role = entry?.role === "assistant" ? "assistant" : "user";
					const body = typeof entry?.content === "string" ? entry.content : "";
					if (body === "") continue;
					messages.push(editorAgentMessage(role, body, entry.provider ?? useProvider, entry.model ?? useModel));
				}
				let reply = "";
				let failure = null;
				try {
					const stream = llm.stream({
						provider: useProvider,
						model: useModel,
						system: EDITOR_AGENT_SYSTEM,
						messages
					});
					for await (const chunk of stream) {
						if (chunk?.type === "text-delta" && typeof chunk.text === "string") reply += chunk.text;
						else if (chunk?.type === "finish" && chunk.reason?.kind === "error") failure = chunk.reason.failure?.message ?? "model call failed";
						else if (chunk?.type === "finish" && chunk.reason?.kind === "aborted") failure = "已取消";
					}
					if (failure !== null && reply === "") console.warn(`[dsh-vscode] subagent call failed: ${failure}`);
				} catch (error) {
					failure = error instanceof Error ? error.message : "model call failed";
					console.warn(`[dsh-vscode] subagent call failed: ${failure}`);
				}
				/* Persist the user turn even when the call failed — the memory must not lose input. */
				if (failure !== null && reply === "") {
					await writeFileAsync(transcriptFile, history.map((entry) => JSON.stringify(entry)).join("\n") + "\n", "utf8");
					return fail("IO", failure);
				}
				const assistantEntry = {
					role: "assistant",
					content: reply,
					ts: now(),
					provider: useProvider,
					model: useModel
				};
				history.push(assistantEntry);
				await writeFileAsync(transcriptFile, history.map((entry) => JSON.stringify(entry)).join("\n") + "\n", "utf8");
				const agents = await readEditorAgentIndex(self.root);
				const next = agents.map((agent) => agent.id === id ? {
					...agent,
					updatedAt: assistantEntry.ts,
					messageCount: history.filter((entry) => entry.role === "user").length
				} : agent);
				await writeEditorAgentIndex(self.root, next);
				return {
					ok: true,
					reply,
					messageCount: assistantEntry ? history.filter((entry) => entry.role === "user").length : 0
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "model call failed");
			}
		}
		/**
		* Drop one subagent: its transcript, its inbox, and its registry row.
		* @param id - subagent id.
		* @returns ok when the row is gone.
		*/
		async deleteEditorAgent(id) {
			const self = selfOf(this);
			try {
				assertEditorAgentId(id);
				for (const suffix of [void 0, ".inbox.jsonl"]) await unlinkAsync(editorAgentPath(self.root, id, suffix)).catch(() => {});
				const agents = await readEditorAgentIndex(self.root);
				await writeEditorAgentIndex(self.root, agents.filter((agent) => agent.id !== id));
				return { ok: true };
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot delete subagent");
			}
		}
		/**
		* The folder that belongs to one session.
		*
		* Every session inside a DSH workspace shares that workspace's cwd, so
		* there is no native per-session directory. This mints one on first use:
		* the folder is named after the session title, collisions against sibling
		* sessions get a numeric suffix, and the sessionId → name mapping is
		* durable — renaming a session therefore never moves its files.
		*
		* An already-existing directory with the wanted name is REUSED rather than
		* duplicated: a workspace that already holds a folder by that name is more
		* likely the user's intent than an accident.
		*
		* The folder holds what belongs to ONE session — its own notes, artifacts
		* and subagent memory — never a copy of the workspace. See
		* {@link seedSessionDir} for why the distinction is load-bearing.
		* @param sessionId - durable session id.
		* @param title - display title, used only when the folder is minted.
		* @param base - the owning workspace (the session cwd), see {@link sessionDirBase}.
		* @returns the folder name, its absolute path, and whether it was minted now.
		*/
		async resolveSessionDir(sessionId, title, base) {
			const self = selfOf(this);
			try {
				const id = typeof sessionId === "string" ? sessionId.trim() : "";
				if (id === "") return fail("IO", "session id is required");
				const home = sessionDirBase(self, base);
				const map = await readSessionDirMap(home);
				const existing = map[id];
				const taken = new Set(Object.entries(map).filter(([key]) => key !== id).map(([, value]) => value.name.toLowerCase()));
				let name = existing === void 0 ? void 0 : existing.name;
				const minted = name === void 0;
				if (name === void 0) {
					const stem = sessionDirName(title, id);
					name = stem;
					let suffix = 2;
					while (taken.has(name.toLowerCase())) name = `${stem}-${suffix++}`;
					map[id] = {
						name,
						createdAt: new Date().toISOString()
					};
					await writeSessionDirMap(home, map);
				}
			const absolute = join(home, name);
			await mkdirAsync(absolute, { recursive: true });
			/*
			 * Seed on every resolve, not only on mint: folders minted before
			 * seeding existed are still empty shells on disk, and healing them
			 * costs one stat each. `seedSessionDir` never overwrites.
			 *
			 * A seeding failure must never take the folder down with it — the
			 * pin is what makes the session usable, the README is a nicety.
			 */
			try {
				await seedSessionDir(absolute, {
					sessionId: id,
					title: typeof title === "string" ? title : "",
					base: home,
					createdAt: map[id]?.createdAt || new Date().toISOString()
				});
			} catch (error) {
				console.warn(`[dsh-vscode] session folder seed skipped: ${error instanceof Error ? error.message : error}`);
			}
			return {
				ok: true,
				name,
				path: absolute,
				minted
			};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot resolve the session folder");
			}
		}
		/**
		* Every session folder already minted in a workspace, for the picker's
		* session list and for diagnostics.
		* @param base - the owning workspace (the session cwd).
		* @returns one row per mapped session.
		*/
		async listSessionDirs(base) {
			const self = selfOf(this);
			try {
				const home = sessionDirBase(self, base);
				const map = await readSessionDirMap(home);
				return {
					ok: true,
					dirs: Object.entries(map).map(([sessionId, value]) => ({
						sessionId,
						name: value.name,
						path: join(home, value.name)
					}))
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot read the session folders");
			}
		}
		/**
		* Collect the files that belong to ONE session, and put them where the
		* session's own folder can show them.
		*
		* Reads the session's own event log (see {@link extractSessionFiles} for
		* which events count), writes `相关文件.md` as the readable index, and
		* mirrors the produced files into `相关文件/` as hardlinks.
		*
		* Never fails the caller for want of a log: a session that has not run yet
		* has no record to read, and a missing mirror is a far smaller problem
		* than a file panel that refuses to open.
		* @param sessionId - durable session id.
		* @param base - the owning workspace (the session cwd).
		* @returns counts plus the transcript path and any caveats, or a failure
		*   only when the session has no folder at all.
		*/
		async sessionFiles(sessionId, base) {
			const self = selfOf(this);
			try {
				const id = typeof sessionId === "string" ? sessionId.trim() : "";
				if (id === "") return fail("IO", "session id is required");
				const home = sessionDirBase(self, base);
				const map = await readSessionDirMap(home);
				const row = map[id];
				if (row === void 0) return fail("NOT_FOUND", "this session has no folder yet");
				const folder = join(home, row.name);
				const notes = [];
				const empty = (extra) => ({
					ok: true,
					total: 0,
					produced: 0,
					readOnly: 0,
					linked: 0,
					missing: 0,
					transcript: "",
					notes: extra
				});
				const root = await findSessionsRoot();
				if (root === null) return empty(["找不到 DSH 的会话记录目录，相关文件暂时无法整理"]);
				const found = await locateTranscript(root, id);
				if (found === null) return empty(["这个会话还没有运行记录"]);
				const stats = await statAsync(found.file);
				const stamp = `${stats.size}:${Math.round(stats.mtimeMs)}`;
				const cache = await readRelatedCache(folder);
				let files;
				if (isObject(cache) && cache.stamp === stamp && Array.isArray(cache.files)) {
					files = cache.files;
				} else if (stats.size > TRANSCRIPT_MAX_BYTES) {
					notes.push(`会话记录 ${(stats.size / 1048576).toFixed(1)} MB 超过 ${TRANSCRIPT_MAX_BYTES / 1048576} MB 上限，本次未解析`);
					files = [];
				} else {
					const decoded = decodeZstdFrames(await readFileAsync(found.file));
					const extracted = extractSessionFiles(decoded, home);
					/*
					 * Shell-written files are invisible to `extractSessionFiles`:
					 * a command string is not a path. They are recovered from the
					 * command text and then settled against the disk — see
					 * `verifyShellCandidates` for what actually decides it.
					 */
					const probe = extractShellCandidates(decoded, home);
					const confirmed = await verifyShellCandidates(probe);
					files = mergeShellFiles(extracted, confirmed);
					if (confirmed.length > 0) notes.push(`其中 ${confirmed.length} 个由 shell 命令写入（已按命令时刻与文件改动时间核对）`);
				}
				const mirrorInfo = await mirrorRelatedFiles(folder, files);
				const produced = files.filter((entry) => entry.rank >= RELATED_RANK.edited).length;
				const at = new Date().toISOString();
				/*
				 * The index is written even when the set is empty: a file that
				 * explains "nothing yet, and here is why" beats an empty folder
				 * the user has to interpret.
				 */
				await writeFileAsync(join(folder, RELATED_INDEX), relatedIndexText({
					sessionId: id,
					title: row.name,
					base: home,
					at
				}, files, mirrorInfo), "utf8");
				await writeRelatedCache(folder, {
					version: 1,
					stamp,
					at,
					files,
					built: mirrorInfo.built
				});
				notes.push(...mirrorInfo.notes);
				return {
					ok: true,
					total: files.length,
					produced,
					readOnly: files.length - produced,
					linked: mirrorInfo.linked,
					missing: mirrorInfo.missing,
					transcript: found.file,
					notes
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot collect the session files");
			}
		}
		/**
		* Every file under `root`, relative, for the editor's quick-open index.
		*
		* The tree is lazy — it lists one directory at a time — which is right for
		* rendering and useless for "jump to a file by name", the single most-used
		* VSCode shortcut. So this walks once and hands back a flat, sortable list.
		* Directories are not returned: quick-open opens files.
		*
		* Bounded on purpose (`FILES_MAX` entries, `FILES_MAX_DEPTH` levels) so a
		* mistyped root cannot turn into a multi-minute walk; `truncated` says
		* whether the bound was hit rather than hiding it.
		* @param root - absolute directory; defaults to the current root.
		* @param max - optional entry ceiling.
		* @returns `{ ok, root, files, truncated }`.
		*/
		async listFiles(root, max) {
			const self = selfOf(this);
			const next = typeof root === "string" && root.trim() !== "" ? root.trim() : self.root;
			const ceiling = typeof max === "number" && Number.isFinite(max) ? Math.max(1, Math.min(FILES_MAX, Math.floor(max))) : FILES_MAX;
			try {
				if (!statSync(next).isDirectory()) return fail("IO", "root is not a directory");
				const base = realpathSync(next);
				const files = [];
				let truncated = false;
				const queue = [{ dir: base, rel: "", depth: 0 }];
				while (queue.length > 0) {
					const current = queue.shift();
					let entries;
					try {
						entries = await readdirAsync(current.dir, { withFileTypes: true });
					} catch {
						continue; /* unreadable directory: skip it, keep the walk alive */
					}
					for (const entry of entries) {
						if (files.length >= ceiling) {
							truncated = true;
							break;
						}
						const rel = current.rel === "" ? entry.name : `${current.rel}/${entry.name}`;
						const flat = flatPath(rel);
						if (RELATED_SKIP.test(flat)) continue;
						if (entry.isDirectory()) {
							if (current.depth + 1 <= FILES_MAX_DEPTH) queue.push({
								dir: join(current.dir, entry.name),
								rel,
								depth: current.depth + 1
							});
							continue;
						}
						if (!entry.isFile() && !entry.isSymbolicLink()) continue;
						/*
						 * Size is needed to skip huge files at open time, and a
						 * symlink to a file has to be stat'ed to be counted at all —
						 * one stat per file, which is why this is a separate call
						 * from the tree's per-directory listing.
						 */
						let size = 0;
						let mtimeMs = 0;
						try {
							const stats = await statAsync(join(current.dir, entry.name));
							if (!stats.isFile()) continue;
							size = stats.size;
							mtimeMs = stats.mtimeMs;
						} catch {
							continue;
						}
						files.push({
							rel,
							name: entry.name,
							size,
							mtimeMs
						});
					}
					if (truncated) break;
				}
				return {
					ok: true,
					root: base,
					files,
					truncated
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot list files");
			}
		}
		async setRoot(root) {
			const self = selfOf(this);
			const next = root.trim();
			if (next === "") return fail("IO", "root must be a non-empty absolute directory");
			try {
				if (!statSync(next).isDirectory()) return fail("IO", "root is not a directory");
				self.root = realpathSync(next);
				self.pinned = true;
				return {
					ok: true,
					root: self.root
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot set root");
			}
		}
		async list(path) {
			const self = selfOf(this);
			const guarded = guardRel(self, path);
			if (!guarded.ok) return guardFail(guarded.reason);
			ensureWatching(self.root);
			try {
				// `withFileTypes` answers "file or directory" from the directory
				// entry itself, so no per-child `stat` is needed. The previous
				// implementation stat'ed every child only to compute a `size`
				// field the client never read.
				const dirents = await readdirAsync(guarded.absolute, { withFileTypes: true });
				const entries = [];
				for (const dirent of dirents) {
					const name = dirent.name;
					if (name === ".DS_Store") continue;
					let isDirectory;
					if (dirent.isDirectory()) isDirectory = true;
					else if (dirent.isFile()) isDirectory = false;
					else if (dirent.isSymbolicLink()) {
						// Keep the old follow-the-link semantics: a symlink to a
						// directory used to be reported as a browsable `dir`.
						try {
							isDirectory = (await statAsync(join(guarded.absolute, name))).isDirectory();
						} catch {
							continue;
						}
					} else continue;
					const childRel = guarded.relative === "" ? name : `${guarded.relative}/${name}`;
					entries.push({
						name,
						path: childRel.replaceAll("\\", "/"),
						kind: isDirectory ? "dir" : "file"
					});
				}
				entries.sort((a, b) => {
					if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
					return a.name.localeCompare(b.name);
				});
				return {
					ok: true,
					entries
				};
			} catch (error) {
				if (isNotFound(error)) return fail("NOT_FOUND", "path not found");
				if (isNotDirectory(error)) return fail("IO", "not a directory");
				return fail("IO", error instanceof Error ? error.message : "list failed");
			}
		}
		async read(path) {
			const guarded = guardRel(selfOf(this), path);
			if (!guarded.ok) return guardFail(guarded.reason);
			try {
				const stats = await statAsync(guarded.absolute);
				if (stats.isDirectory()) return fail("IS_DIR", "path is a directory");
				if (stats.size > MAX_READ_BYTES) return fail("TOO_LARGE", `file is ${formatBytes(stats.size)}; the editor limit is ${formatBytes(MAX_READ_BYTES)}`);
				const buf = await readFileAsync(guarded.absolute);
				const sample = buf.subarray(0, SAMPLE_BYTES);
				if (!isEditableText(guarded.absolute, sample)) return fail("IS_BINARY", "file looks binary and cannot be edited");
				return {
					ok: true,
					content: buf.toString("utf8"),
					mtimeMs: stats.mtimeMs
				};
			} catch (error) {
				if (isNotFound(error)) return fail("NOT_FOUND", "path not found");
				return fail("IO", error instanceof Error ? error.message : "read failed");
			}
		}
		/**
		* Save a file, refusing to clobber a newer revision.
		*
		* `expectedMtimeMs` is the mtime the client got from `read` (or -1 when the
		* buffer came from a freshly created file and has no predecessor). If the
		* file on disk moved on — the agent wrote it, another tab saved it, a build
		* step rewrote it — this returns CONFLICT instead of silently winning.
		*
		* The write itself goes through a sibling temp file + rename so a crash
		* mid-save cannot leave a half-written file behind.
		*/
		async write(path, content, expectedMtimeMs) {
			const guarded = guardRel(selfOf(this), path);
			if (!guarded.ok) return guardFail(guarded.reason);
			try {
				let current = null;
				try {
					current = await statAsync(guarded.absolute);
				} catch (error) {
					if (!isNotFound(error)) return fail("IO", error instanceof Error ? error.message : "stat failed");
				}
				if (current !== null && current.isDirectory()) return fail("IS_DIR", "path is a directory");
				const expects = typeof expectedMtimeMs === "number" && Number.isFinite(expectedMtimeMs) ? Math.round(expectedMtimeMs) : -1;
				if (expects >= 0 && current !== null && Math.round(current.mtimeMs) !== expects) return fail("CONFLICT", "file changed on disk since it was opened");
				const temporary = join(dirname(guarded.absolute), `.${basename(guarded.absolute)}.dsh-${process.pid}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.tmp`);
				await writeFileAsync(temporary, content, "utf8");
				try {
					await renameAsync(temporary, guarded.absolute);
				} catch (error) {
					await unlinkAsync(temporary).catch(() => {});
					throw error;
				}
				const written = await statAsync(guarded.absolute);
				return {
					ok: true,
					mtimeMs: written.mtimeMs
				};
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "write failed");
			}
		}
		/** Paths touched since `since`; the client polls this and diffs the tree. */
		async changes(since) {
			const self = selfOf(this);
			ensureWatching(self.root);
			const feed = changesSince(since);
			return {
				ok: true,
				revision: feed.revision,
				paths: feed.paths
			};
		}
		async mkdir(path) {
			const guarded = guardRel(selfOf(this), path);
			if (!guarded.ok) return guardFail(guarded.reason);
			try {
				await mkdirAsync(guarded.absolute, { recursive: false });
				return { ok: true };
			} catch (error) {
				if (isExists(error)) return fail("EXISTS", "path already exists");
				if (isNotFound(error)) return fail("NOT_FOUND", "parent directory not found");
				return fail("IO", error instanceof Error ? error.message : "mkdir failed");
			}
		}
		async rename(from, to) {
			const self = selfOf(this);
			const fromG = guardRel(self, from);
			if (!fromG.ok) return guardFail(fromG.reason);
			const toG = guardRel(self, to);
			if (!toG.ok) return guardFail(toG.reason);
			try {
				if (!(await pathExists(fromG.absolute))) return fail("NOT_FOUND", "source not found");
				// `fs.rename` silently REPLACES an existing file on Windows, which
				// would destroy the destination without ever telling the caller.
				if (await pathExists(toG.absolute)) return fail("EXISTS", "destination already exists");
				await renameAsync(fromG.absolute, toG.absolute);
				return { ok: true };
			} catch (error) {
				if (isNotFound(error)) return fail("NOT_FOUND", "source not found");
				if (isExists(error) || isNotEmpty(error)) return fail("EXISTS", "destination already exists");
				return fail("IO", error instanceof Error ? error.message : "rename failed");
			}
		}
		/** Named `unlink` — Client remote forbids `remove` (Cordis Service.prototype). */
		async unlink(path) {
			const guarded = guardRel(selfOf(this), path);
			if (!guarded.ok) return guardFail(guarded.reason);
			if (guarded.relative === "") return fail("IO", "cannot remove workspace root");
			try {
				const stats = await statAsync(guarded.absolute);
				if (stats.isDirectory()) {
					await rmdirAsync(guarded.absolute);
				} else await unlinkAsync(guarded.absolute);
				return { ok: true };
			} catch (error) {
				if (isNotFound(error)) return fail("NOT_FOUND", "path not found");
				if (isNotEmpty(error)) return fail("NOT_EMPTY", "directory is not empty");
				return fail("IO", error instanceof Error ? error.message : "unlink failed");
			}
		}
		/** Open the workspace root in the OS file manager (Finder / Explorer / xdg-open). */
		async revealRoot() {
			const self = selfOf(this);
			try {
				await openInFileManager(self.root);
				return { ok: true };
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot open file manager");
			}
		}
		/**
		* Open a workspace-relative path in the OS file manager.
		* Directories open as folders; files reveal their parent directory.
		*/
		async revealPath(path) {
			const guarded = guardRel(selfOf(this), path);
			if (!guarded.ok) return guardFail(guarded.reason);
			try {
				await openInFileManager(statSync(guarded.absolute).isDirectory() ? guarded.absolute : dirname(guarded.absolute) || guarded.absolute);
				return { ok: true };
			} catch (error) {
				if (isNotFound(error)) return fail("NOT_FOUND", "path not found");
				return fail("IO", error instanceof Error ? error.message : "cannot open file manager");
			}
		}
		/**
		* Read the local VSCode-family user profile so the client can adopt the
		* user's theme and explicitly configured editor options.
		*
		* Read-only by design: nothing is ever written back to the VSCode install.
		* `found: false` is a normal outcome (VSCode simply is not installed) and
		* callers must treat it as "keep current defaults", not as an error.
		*/
		async vscodeProfile() {
			try {
				return detectVscodeProfile();
			} catch (error) {
				return fail("IO", error instanceof Error ? error.message : "cannot read vscode profile");
			}
		}
	};
})();
//#region VSCode profile import
/**
* Candidate VSCode-family installs, most common first.
*
* Only two locations matter: the User settings file (carries
* `workbench.colorTheme` plus any explicit `editor.*` overrides) and the
* extension folder (where third-party theme definitions live — built-in themes
* are resolved by name instead).
*/
function vscodeCandidates() {
	const home = homedir();
	const os = platform();
	const roaming = process.env.APPDATA ?? join(home, "AppData", "Roaming");
	const support = join(home, "Library", "Application Support");
	const config = process.env.XDG_CONFIG_HOME ?? join(home, ".config");
	const out = [];
	const push = (label, configRoot, extensionsDir) => out.push({
		label,
		settingsPath: join(configRoot, "User", "settings.json"),
		extensionsDir
	});
	if (os === "win32") {
		push("Code", join(roaming, "Code"), join(home, ".vscode", "extensions"));
		push("Code - Insiders", join(roaming, "Code - Insiders"), join(home, ".vscode-insiders", "extensions"));
		push("VSCodium", join(roaming, "VSCodium"), join(home, ".vscode-oss", "extensions"));
		push("Cursor", join(roaming, "Cursor"), join(home, ".cursor", "extensions"));
		push("Windsurf", join(roaming, "Windsurf"), join(home, ".windsurf", "extensions"));
	} else if (os === "darwin") {
		push("Code", join(support, "Code"), join(home, ".vscode", "extensions"));
		push("Code - Insiders", join(support, "Code - Insiders"), join(home, ".vscode-insiders", "extensions"));
		push("VSCodium", join(support, "VSCodium"), join(home, ".vscode-oss", "extensions"));
		push("Cursor", join(support, "Cursor"), join(home, ".cursor", "extensions"));
	} else {
		push("Code", join(config, "Code"), join(home, ".vscode", "extensions"));
		push("Code - Insiders", join(config, "Code - Insiders"), join(home, ".vscode-insiders", "extensions"));
		push("VSCodium", join(config, "VSCodium"), join(home, ".vscode-oss", "extensions"));
		push("Cursor", join(config, "Cursor"), join(home, ".cursor", "extensions"));
	}
	return out;
}
/**
* Tolerant JSONC reader for VSCode json files (settings.json and theme
* definitions both allow comments and trailing commas).
*
* Implemented as a character walker rather than regexes for two reasons: `//`
* occurring inside a string value has to survive untouched, and a trailing
* comma can only be dropped when it is real syntax — `"a,}"` is a value, not a
* comma before a brace. The walk therefore also records which emitted
* characters came from inside a string and consults that mask when collapsing
* trailing commas.
*/
function parseJsonc(text) {
	let out = "";
	/** Per-character flag: did this emitted character come from a string literal? */
	const quoted = [];
	const emit = (chunk, isQuoted) => {
		out += chunk;
		for (let k = 0; k < chunk.length; k += 1) quoted.push(isQuoted);
	};
	let inString = false;
	let inLineComment = false;
	let inBlockComment = false;
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		const next = text[i + 1];
		if (inLineComment) {
			if (ch === "\n") {
				inLineComment = false;
				emit(ch, false);
			}
			continue;
		}
		if (inBlockComment) {
			if (ch === "*" && next === "/") {
				inBlockComment = false;
				i += 1;
			}
			continue;
		}
		if (inString) {
			if (ch === "\\") {
				emit(ch + (next ?? ""), true);
				i += 1;
				continue;
			}
			emit(ch, true);
			if (ch === "\"") inString = false;
			continue;
		}
		if (ch === "\"") {
			inString = true;
			emit(ch, true);
			continue;
		}
		if (ch === "/" && next === "/") {
			inLineComment = true;
			i += 1;
			continue;
		}
		if (ch === "/" && next === "*") {
			inBlockComment = true;
			i += 1;
			continue;
		}
		emit(ch, false);
	}
	let cleaned = "";
	for (let i = 0; i < out.length; i += 1) {
		const ch = out[i];
		if (ch === "," && quoted[i] !== true) {
			let j = i + 1;
			while (j < out.length && (out[j] === " " || out[j] === "\t" || out[j] === "\n" || out[j] === "\r")) j += 1;
			if (j < out.length && (out[j] === "}" || out[j] === "]")) {
				i = j - 1;
				continue;
			}
		}
		cleaned += ch;
	}
	return JSON.parse(cleaned);
}
/**
* VSCode setting key -> Monaco editor option, mapped by hand because the two
* naming schemes only overlap partially. Nested options use a [group, field]
* tuple so the value can be rebuilt as `{ group: { field: value } }`.
*
* Only keys present in settings.json are imported: unset VSCode settings fall
* back to VSCode's own defaults, which are not necessarily what this editor
* wants, so absence is left alone on purpose.
*/
const VSCODE_EDITOR_OPTION_MAP = {
	"editor.fontSize": "fontSize",
	"editor.fontFamily": "fontFamily",
	"editor.fontWeight": "fontWeight",
	"editor.fontLigatures": "fontLigatures",
	"editor.lineHeight": "lineHeight",
	"editor.letterSpacing": "letterSpacing",
	"editor.tabSize": "tabSize",
	"editor.insertSpaces": "insertSpaces",
	"editor.detectIndentation": "detectIndentation",
	"editor.wordWrap": "wordWrap",
	"editor.wrappingIndent": "wrappingIndent",
	"editor.renderWhitespace": "renderWhitespace",
	"editor.renderLineHighlight": "renderLineHighlight",
	"editor.renderControlCharacters": "renderControlCharacters",
	"editor.cursorBlinking": "cursorBlinking",
	"editor.cursorStyle": "cursorStyle",
	"editor.cursorSmoothCaretAnimation": "cursorSmoothCaretAnimation",
	"editor.smoothScrolling": "smoothScrolling",
	"editor.mouseWheelZoom": "mouseWheelZoom",
	"editor.rulers": "rulers",
	"editor.formatOnPaste": "formatOnPaste",
	"editor.linkedEditing": "linkedEditing",
	"editor.codeLens": "codeLens",
	"editor.colorDecorators": "colorDecorators",
	"editor.scrollBeyondLastLine": "scrollBeyondLastLine",
	"editor.tabCompletion": "tabCompletion",
	"editor.acceptSuggestionOnEnter": "acceptSuggestionOnEnter",
	"editor.autoClosingBrackets": "autoClosingBrackets",
	"editor.autoClosingQuotes": "autoClosingQuotes",
	"editor.autoClosingTags": "autoClosingTags",
	"editor.autoSurround": "autoSurround",
	"editor.wordBasedSuggestions": "wordBasedSuggestions",
	"editor.occurrencesHighlight": "occurrencesHighlight",
	"editor.selectionHighlight": "selectionHighlight",
	"editor.folding": "folding",
	"editor.foldingStrategy": "foldingStrategy",
	"editor.showFoldingControls": "showFoldingControls",
	"editor.matchBrackets": "matchBrackets",
	"editor.autoIndent": "autoIndent",
	"editor.lineNumbers": "lineNumbers",
	"editor.glyphMargin": "glyphMargin",
	"editor.minimap.enabled": [
		"minimap",
		"enabled"
	],
	"editor.bracketPairColorization.enabled": [
		"bracketPairColorization",
		"enabled"
	],
	"editor.guides.indentation": [
		"guides",
		"indentation"
	],
	"editor.guides.bracketPairs": [
		"guides",
		"bracketPairs"
	],
	"editor.stickyScroll.enabled": [
		"stickyScroll",
		"enabled"
	],
	"editor.suggest.preview": [
		"suggest",
		"preview"
	],
	"editor.parameterHints.enabled": [
		"parameterHints",
		"enabled"
	],
	"editor.hover.enabled": [
		"hover",
		"enabled"
	],
	"editor.unicodeHighlight.ambiguousCharacters": [
		"unicodeHighlight",
		"ambiguousCharacters"
	],
	"editor.scrollbar.verticalScrollbarSize": [
		"scrollbar",
		"verticalScrollbarSize"
	]
};
/**
* VSCode settings whose value domain drifted away from Monaco's.
*
* Both keys are plain booleans in Monaco but were later re-typed as enums in
* VSCode (`off` / `singleFile` / `multiFile`, and `off` / `currentDocument` /
* `matchingDocuments` / `allDocuments`). Forwarding those strings verbatim
* would make `"off"` truthy and switch on exactly the feature the user turned
* off, so they are folded back to a boolean.
*/
const VSCODE_BOOLEAN_FALLBACK_KEYS = /* @__PURE__ */ new Set([
	"editor.occurrencesHighlight",
	"editor.wordBasedSuggestions"
]);
/**
* Reconcile a VSCode value with Monaco's expected domain.
*
* Values that need no translation pass through untouched; an enum that Monaco
* still models as a boolean is collapsed to one.
*/
function normalizeEditorOptionValue(key, value) {
	if (VSCODE_BOOLEAN_FALLBACK_KEYS.has(key)) return !(value === false || value === "off" || value === "none");
	return value;
}
/** Map explicit `editor.*` entries onto Monaco editor options. */
function extractEditorOptions(settings) {
	const out = {};
	for (const [key, value] of Object.entries(settings)) {
		const target = VSCODE_EDITOR_OPTION_MAP[key];
		if (target === void 0) continue;
		const normalized = normalizeEditorOptionValue(key, value);
		if (Array.isArray(target)) {
			const [group, field] = target;
			const bucket = out[group] !== void 0 && typeof out[group] === "object" && !Array.isArray(out[group]) ? out[group] : {};
			bucket[field] = normalized;
			out[group] = bucket;
			continue;
		}
		out[target] = normalized;
	}
	return out;
}
/** VSCode theme type -> Monaco base theme id. */
function themeBase(type) {
	const value = String(type ?? "").toLowerCase();
	if (value === "light") return "vs";
	if (value === "hclight") return "hc-light";
	if (value === "hc" || value === "hcblack" || value === "hc-black") return "hc-black";
	return "vs-dark";
}
/** Built-in themes, which have no extension manifest to read. */
const BUILTIN_THEME_TYPES = {
	"Default Dark Modern": "dark",
	"Default Dark+": "dark",
	"Default High Contrast": "hc",
	"Default High Contrast Light": "hcLight",
	"Default Light Modern": "light",
	"Default Light+": "light",
	"Visual Studio Dark": "dark",
	"Visual Studio Light": "light"
};
/**
* Locate a theme definition by label.
*
* Built-in labels resolve to a base theme + type. Anything else is looked up in
* the installed extensions: each folder's manifest lists contributed themes with
* a path to the theme JSON, which carries `colors` (workbench palette) and
* `tokenColors` (TextMate scopes). Both are needed to approximate the theme.
*/
function findThemeDefinition(extensionsDir, label) {
	if (Object.prototype.hasOwnProperty.call(BUILTIN_THEME_TYPES, label)) return {
		name: label,
		type: BUILTIN_THEME_TYPES[label],
		uiTheme: "",
		colors: {},
		tokenColors: []
	};
	if (label === "" || typeof extensionsDir !== "string" || !existsSync(extensionsDir)) return null;
	let folders;
	try {
		folders = readdirSync(extensionsDir, { withFileTypes: true });
	} catch {
		return null;
	}
	for (const folder of folders) {
		if (!folder.isDirectory()) continue;
		const manifestPath = join(extensionsDir, folder.name, "package.json");
		if (!existsSync(manifestPath)) continue;
		let manifest;
		try {
			manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
		} catch {
			continue;
		}
		const themes = manifest?.contributes?.themes;
		if (!Array.isArray(themes)) continue;
		for (const entry of themes) {
			if (entry?.label !== label || typeof entry.path !== "string") continue;
			const themePath = join(extensionsDir, folder.name, entry.path.replace(/^\.\//, ""));
			if (!existsSync(themePath)) continue;
			try {
				const definition = parseJsonc(readFileSync(themePath, "utf8"));
				if (definition?.colors === void 0 && definition?.tokenColors === void 0) continue;
				return {
					name: typeof definition.name === "string" ? definition.name : label,
					type: typeof definition.type === "string" ? definition.type : entry.uiTheme === "vs" ? "light" : "dark",
					uiTheme: typeof entry.uiTheme === "string" ? entry.uiTheme : "",
					colors: definition.colors ?? {},
					tokenColors: Array.isArray(definition.tokenColors) ? definition.tokenColors : []
				};
			} catch {
				continue;
			}
		}
	}
	return null;
}
/**
* Probe the local VSCode installation.
*
* The payload is returned as a JSON string: the typert codec is strict, and a
* theme carries 200+ colour keys plus hundreds of token rules, so describing
* that shape as a schema would be noisy and fragile for no benefit.
*/
function detectVscodeProfile() {
	for (const candidate of vscodeCandidates()) {
		if (!existsSync(candidate.settingsPath)) continue;
		let settings;
		try {
			settings = parseJsonc(readFileSync(candidate.settingsPath, "utf8"));
		} catch {
			continue;
		}
		if (settings === null || typeof settings !== "object" || Array.isArray(settings)) continue;
		const themeLabel = typeof settings["workbench.colorTheme"] === "string" ? settings["workbench.colorTheme"] : "";
		const theme = themeLabel === "" ? null : findThemeDefinition(candidate.extensionsDir, themeLabel);
		return {
			ok: true,
			found: true,
			source: candidate.label,
			profile: JSON.stringify({
				source: candidate.label,
				settingsPath: candidate.settingsPath,
				themeLabel,
				theme,
				editorOptions: extractEditorOptions(settings)
			})
		};
	}
	return {
		ok: true,
		found: false,
		source: "",
		profile: ""
	};
}
//#endregion
function openInFileManager(absolute) {
	return new Promise((resolve, reject) => {
		const platform$1 = platform();
		let child;
		if (platform$1 === "darwin") child = spawn("open", [absolute], {
			stdio: "ignore",
			detached: true
		});
		else if (platform$1 === "win32") child = spawn("explorer", [absolute], {
			stdio: "ignore",
			detached: true
		});
		else child = spawn("xdg-open", [absolute], {
			stdio: "ignore",
			detached: true
		});
		child.on("error", reject);
		child.unref();
		resolve();
	});
}
function isNotFound(error) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
function isExists(error) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "EEXIST";
}
function isNotDirectory(error) {
	return typeof error === "object" && error !== null && "code" in error && error.code === "ENOTDIR";
}
/** Async existence probe — `stat` that maps ENOENT to `false`. */
async function pathExists(absolute) {
	try {
		await statAsync(absolute);
		return true;
	} catch (error) {
		if (isNotFound(error)) return false;
		throw error;
	}
}
function isNotEmpty(error) {
	return typeof error === "object" && error !== null && "code" in error && (error.code === "ENOTEMPTY" || error.code === "EEXIST");
}
/** Human-readable byte count for error messages shown in the editor banner. */
function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes < 0) return "unknown size";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MiB`;
}
//#endregion
//#region lib/types/host/settings/schema.js
/** Host settings namespace for the file explorer plugin card. */
const FILE_EXPLORER_NS = "file-explorer";
const FileExplorerSettingsSchema = z.object({
	root: z.string().default(""),
	openLinksInEditor: z.boolean().default(false)
});
//#endregion
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
export { Config, apply, inject, name };
