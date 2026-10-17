# Local patched fork — notes

Base: `github:supanexus/dsh-plugin-file-explorer#v0.1.0` (upstream unchanged, no write access).

## Why this fork exists

v0.1.0 fails to import on DSH 0.2.0-rc.2:

```
The requested module '@deepseek-ai/dsh-settings'
does not provide an export named 'settingsNamespace'
```

`dsh-settings` used to export a `settingsNamespace()` branded-string helper.
It now validates the namespace id inside `register()` itself via
`parseSettingsNamespace` (`/^[a-z][a-z0-9-]*$/`) and no longer exports the
helper. The old helper was a pure identity wrapper, so the fix is to pass the
literal `"file-explorer"`.

## Changes vs upstream v0.1.0

1. `lib/index.js` — dropped the `import { settingsNamespace }` line and
   inlined `settingsNamespace("file-explorer")` → `"file-explorer"`.
   This is the fix that makes the Host half importable.
2. `cordis.patch.yml` — pinned `root` to the session workspace
   (`D:/30651/DeepSeekHarness/Workspaces`).

### Why change #2 matters

Upstream shipped `root: !!js process.cwd()`. Under the desktop host the CWD
is the application directory (`.../app.asar/dsh`), not a user workspace, so
the tree would have shown the DSH application tree and the path guard would
have rooted every read/write inside the app install. Config now points at the
real workspace.

## Verified NOT broken (checked, no change needed)

- The settings schema already uses `@deepseek-ai/schemastery` (`z`), not the
  npm `zod` package that `dependencies` lists. `register()` calls the schema
  as a function and calls `.toJSON()` on it, so a schemastery contract is
  required. `zod` stays an unused dependency; it is only used by the client
  bundle, which inlines it.
- `lib/client.js` is self-contained: only React / zod / marked are imported,
  all inlined. No stale `@deepseek-ai/*` peer imports.

## Install

Installed with `link:` so pnpm records a link instead of a registry copy —
the earlier `github:` install in the desktop profile was reverted ~24 min
after install, and a link is far less likely to be clobbered by a profile
reconcile.

The Host entry is verified importable. Client rendering was NOT verified —
the client half needs a real browser.
## Addendum: typert.host.js codec fix (2026-10-12 evening)

The "zod is client-only, stays unused" claim above was **wrong**: `lib/types/typert.host.js`
(the Host Typert face) also imports zod. Two further incompatibilities existed:

1. `ERR_MODULE_NOT_FOUND: zod` — the fork had no zod installed. Fixed by copying the exact
   runtime copy (zod 4.6.5) from the app runtime into `node_modules/zod`.
2. `result codec has no create() factory` — typert-loader requires codecs shaped
   `{ mode:'strict', typeSymbol, create: () => schema }` (see `requireStrictCodec` in
   `dsh-typert-loader`, and generated faces like `dsh-api-job-controller/lib/typert.host.js`
   which emit `create: () => (cache ??= z.object({...}))`). The fork used `schema:` instead.
   Fixed by replacing `schema:` with `create: () => schema` in `strParam()` and `resultCodec()`.

Verified end-to-end against DSH 0.2.0-rc.2: host boots, typert-loader activates, and the
`explorerFs/getRoot` RPC returns `{ ok: true, root: "D:/30651/DeepSeekHarness/Workspaces" }`.

Backup: `lib/types/typert.host.js.bak-20261012`

## Addendum: client half activation fix (2026-10-12 evening, round 2)

Symptom: `web boot: 1 entry did not activate`. Root causes, in the order the
fiber hit them:

1. **`waiting for service: settingsScope`** — `lib/client.js` injected a
   `settingsScope` service that does not exist in 0.2.0-rc.2 (grep across the
   whole runtime: zero hits). The real provider is `configForms`, published by
   `@deepseek-ai/dsh-client-ui-settings` via `super(ctx, "configForms")`.
   Its `ConfigFormController` already exposes `getSnapshot()` / `subscribe()` /
   `set(field, value)`, which is exactly the shape the fork's card consumed.
   Fix: inject `configForms`, and replace
   `ctx.settingsScope.bind({namespace})` with `ctx.configForms.get(namespace)`.

2. **`settings.plugin.item` slot does not exist** — the Plugins settings
   section in 0.2.0-rc.2 declares `children: { "settings.plugins.tab": list }`.
   Fix: register a `settings.plugins.tab` entry (id = settings namespace,
   order 30) wrapping the card in a `<ul>` (the card renders an `<li>`).

3. **`explorerFs/getRoot result strict codec has no create() factory`** — the
   SAME codec-shape bug fixed earlier in `lib/types/typert.host.js` also
   existed in the client's `TYPERT_REMOTE` face (`strParam()` / `resultCodec()`).
   Fix: `schema:` → `create: () => schema` there too.

4. **`Cannot read properties of undefined (reading 'store')`** — the card
   passed `scope.subscribe` as a bare method reference into
   `useSyncExternalStore`; `ConfigFormController.subscribe` is a prototype
   method, so `this` was undefined. Fix: `(l) => scope.subscribe(l)`.

5. **Settings namespace absent from `settings.describe`** — in 0.2.0-rc.2 a
   plugin's settings namespace IS its cordis entry config: `SettingsForms`
   has **no `register()` method**, and `describe()` derives `ns` from
   `entry.options.id`, skipping entries whose runtime `Config` has no
   volatile fields. Fixes:
   - host `apply()` no longer calls `settingsCtx.settings.register(...)`; the
     fiber reload on config edit re-applies the root.
   - `Config.openLinksInEditor` is now `.volatile()` (live-editable surface).
   - client `FILE_EXPLORER_SETTINGS_NS` = `"supanexus-file-explorer"` (the
     entry id from `cordis.patch.yml`), not `"file-explorer"`.
   - the card hides the root field when `value.root` is absent (root stays an
     ordinary, config-pinned field and is intentionally not volatile).

Verified end-to-end (real Chromium via puppeteer-core against `dsh web`):
boot clean with 0 console errors, `conversation.view` tab 文件 renders the
tree, Settings → 内置插件 → SupaNexus 文件浏览 expands, toggling
`openLinksInEditor` persists (describe revision 0→1, `user` layer updated),
and toggling back also clean.

Backups: `lib/client.js.bak-20261012-settingsscope`. The `try/catch` wrapper
around `apply()` is kept intentionally: it logs the real activation error to
the console instead of the opaque `failed` fiber state.

## Addendum 2 — Monaco capability layer

Scope: make the editor behave like an editor rather than a syntax-highlighted
text box. All changes are in `lib/client.js`.

1. **Web workers were never wired.** Monaco's bundled language services
   (JSON / TypeScript / JavaScript / CSS / HTML) are worker-backed and stay
   completely dormant without `MonacoEnvironment`, so the editor had no
   completion, validation, hover or definition lookup — colouring only.
   - `ensureMonacoEnvironment()` installs a `getWorkerUrl` returning a
     same-origin blob (a cross-origin worker URL is rejected outright).
   - The blob first sets `self.MonacoEnvironment.baseUrl`, then
     `importScripts()` the CDN `base/worker/workerMain.js`. Two traps:
     * `language/<lang>/<lang>Worker.js` are **AMD modules**, not worker entry
       points — importing one throws `define is not defined`.
     * `workerMain.js` resolves its own directory as
       `MonacoEnvironment.baseUrl || "../../../"`. A blob worker has no real
       location, so that relative fallback breaks; `baseUrl` must be passed
       explicitly and be the parent of `vs/` (the CDN `min/` directory).
   - Monaco 0.52 names these files `jsonWorker.js` / `tsWorker.js`
     (there is no `*.worker.js` variant).
2. **Language service defaults** — `configureMonacoLanguages()` sets TS/JS
   compiler options (`target: ESNext`, `moduleResolution: NodeJs`) and narrows
   diagnostics: there is no tsconfig or node_modules here, so unresolved-import
   errors would paint every file red and drown out real errors. JSON validation
   enabled, comments and trailing commas tolerated.
3. **Model URIs** — models used to inherit the anonymous `inmemory://model/N`
   URI. The TS worker infers file kind from the URI, so every `.ts` file was
   treated as JavaScript and reported `8010 Type annotations can only be used in
   TypeScript files`. `modelUriFor()` now builds
   `inmemory://file-explorer/<encoded path>`.
4. **Editor defaults** — folding, bracket-pair colourisation, indent/bracket
   guides, `linkedEditing` (HTML tag rename, i.e. VSCode's behaviour),
   auto-closing tags, `formatOnPaste`, parameter hints, colour decorators, code
   lens, sticky scroll, selection whitespace, smooth scrolling, and
   `unicodeHighlight.nonBasicASCII: false` (otherwise Chinese text is flagged).
5. **Format action** — a `Format` toolbar button (only for languages whose
   formatter ships in stock Monaco: js/ts/json/css/html) plus `Shift+Alt+F`.
6. **CDN load resilience** — the loader timeout is a hard fallback: exceeding it
   swaps the whole editor for a textarea, and it used to be permanent. Budget
   raised 12s → 30s, and the mount effect now retries up to 3 times, 4s apart.
   The retry matters because the timeout rejects while the underlying fetch may
   still land — a retry resolves immediately off the already-populated
   `window.monaco` instead of leaving the session stuck in textarea mode.

Verified end-to-end (real Chromium via puppeteer-core against `dsh web`):
- JSON: `{ "a": }` reports `Value expected` (severity 8).
- TypeScript: `const n: number = "str"` reports **2322**; the TS worker returns
  1640 completions.
- Format: single-line JSON reformatted to multi-line / 2-space indent, dirty flag
  set, Save persisted it to disk (confirmed by reading the file back).
- All editor options read back as configured; 0 console errors.

Backup: `lib/client.js.bak-20261012-monaco`.

## Addendum 3 — auto-import the local VSCode profile

Scope: a fresh install should look like the editor the user already writes code
in, with no setup at all. Reads the local VSCode-family configuration and adopts
its theme plus any explicitly configured `editor.*` options.

### Host half (`lib/index.js`, `lib/types/typert.host.js`)

1. **`vscodeProfile()` remote method** — new `@Remote` member of the `explorerFs`
   service, returning `{ ok, found, source, profile }` where `profile` is a JSON
   *string*. The payload is a string on purpose: the typert codec is strict and a
   theme carries 200+ palette keys plus hundreds of token rules, so describing
   that shape as a schema would be noisy and fragile for no benefit.
2. **Candidate discovery** — Code / Code - Insiders / VSCodium / Cursor on
   Windows, macOS and Linux (plus Windsurf on Windows). Only two locations
   matter: `<configRoot>/User/settings.json` and the extensions folder. The first
   candidate whose settings file exists wins.
3. **`parseJsonc()`** — hand-written character walker, because VSCode json files
   allow comments and trailing commas, and both a `//` inside a string and a `,`
   inside a string must survive untouched. The walker also records which emitted
   characters came from a string literal, and only that mask decides whether a
   comma is a real trailing comma. The first implementation stripped comments and
   then ran `replace(/,(\s*[}\]])/g, "$1")` over the whole text, which silently
   rewrote the value `"a,}"` into `"a}"` (caught by the fixture test).
4. **`extractEditorOptions()`** — hand-written `editor.*` → Monaco option map
   (nested options use `[group, field]` tuples). Only keys actually present in
   settings.json are imported: unset VSCode settings fall back to VSCode's own
   defaults, which are not necessarily what this editor wants.
   - `normalizeEditorOptionValue()` folds two enums back to booleans: VSCode
     re-typed `editor.occurrencesHighlight` and `editor.wordBasedSuggestions` as
     string enums while Monaco still models them as booleans, so forwarding
     `"off"` verbatim would have been truthy and switched *on* the feature the
     user turned off.
5. **`findThemeDefinition()`** — built-in labels resolve to a type + base theme;
   anything else is looked up through the installed extensions'
   `contributes.themes` manifests. An extension whose theme path is missing is
   skipped rather than fatal, so a stale manifest cannot break the import.

### Client half (`lib/client.js`)

6. **VSCode theme → Monaco theme translation** —
   `scopeToMonacoToken()` maps TextMate scopes onto Monarch token names by
   longest prefix; `buildVscodeThemeRules()` folds `tokenColors` into rules;
   `defineVscodeTheme()` forwards only `editor*` / `minimap*` /
   `scrollbarSlider*` palette keys (a VSCode theme carries workbench-wide colours
   Monaco has no concept of).
   - Rules are staged **narrow-scope-first, generic-scope-last**. A flat token
     space cannot express TextMate specificity, and folding
     `keyword.operator.*` onto `keyword` let a narrow rule repaint the whole
     keyword family — the symptom was Python keywords staying at vs-dark's
     `#569cd6` instead of One Dark Pro's `#c678dd`. `keyword.operator → operator`
     and `string.regexp → regexp` were added so operator colours land on the
     token Monaco actually uses.
   - Known limitation: Monaco has a single `identifier` token while VSCode
     distinguishes `variable` / `entity.name.function` / `support.function`. All
     three collapse onto `identifier`, so identifiers take one palette colour
     instead of VSCode's three.
7. **Seeding without hijacking** — `adoptTheme()` applies the imported theme
   *without* recording a theme choice, so the editor keeps following the VSCode
   configuration on every load. `setTheme()` records a choice via
   `THEME_CHOICE_KEY`, and the import is skipped outright once that key exists.
   - `hydrate()` migration: an appearance blob saved before theme-choice tracking
     existed counts as a deliberate pick **only when it actually moved away from
     the defaults**. A blob that merely carries a custom font size still holds the
     default theme, so it must stay open to the import — otherwise every
     pre-existing user would silently never see the theme they actually use.
8. **Appearance menu** — a fourth `VSCode 主题` / `VSCode theme` chip is appended
   only when a theme was actually imported. `editorThemeVscode` had to be added to
   both dictionaries.

Every failure mode is soft: no VSCode installed → `found: false` → nothing
happens; unparsable settings or an unresolvable theme label → the import is
skipped. Adopting a theme persists nothing, so removing the feature leaves no
residue in a user's stored preferences.

### Verified

- **Fixture unit test** — `D:/开发/_diag/dsh-vscode-fixture.js`, 57 assertions,
  0 failures. The whole host region is extracted verbatim from `lib/index.js` and
  pointed at a synthetic HOME via `HOME` / `USERPROFILE` / `APPDATA`. Covers
  candidate discovery, JSONC edge cases (comments, trailing commas, `",}"` inside
  a string), the full option map, both enum→boolean fallbacks, theme lookup
  (including skipping a broken extension and resolving built-in labels), and the
  `found: false` degradation path.
- **End-to-end** — `D:/开发/_diag/dsh-vscode-regress.js`, real Chromium via
  puppeteer-core against `dsh web`, 16 assertions, 0 failures, 0 console errors:
  - A: fresh user (localStorage cleared) → background `#282c34` (One Dark Pro),
    `VSCode 主题` chip present and selected, nothing written to localStorage.
  - B: picking `深色` by hand → `theme-chosen` written, background returns to
    `#1e1e1e`, and it survives a reload (a deliberate pick is never overridden).
  - C: pre-existing user with a custom font size only → theme still imported,
    font size preserved, `theme-chosen` not written.
  - D: pre-existing user who had explicitly picked the light theme → import
    skipped, migration records the choice, `浅色` stays selected.
- **Token palette** — `D:/开发/_diag/dsh-vscode-tokens.js` on `apk_analyze.py`:
  six One Dark Pro colours actually render — `#282c34` background, `#7f848e`
  comment, `#98c379` string, `#c678dd` keyword, `#56b6c2` operator, `#d19a66`
  number, `#abb2bf` foreground — with no fallback to vs-dark's `#569cd6`.

Backups taken before/after this round:
`lib/client.js.bak-20261012-monaco` (pre-Addendum-2 state),
`lib/types/typert.host.js.bak-20261012` (pre-codec-fix state), and
`lib/{client,index}.js.bak-20261012-addendum3` +
`lib/types/typert.host.js.bak-20261012-addendum3` (this round's finished state).
`lib/index.js` had no pre-Addendum-3 backup; undo it by following the list above.

## Addendum 4 — P0 reliability hardening (2026-10-12 late)

### Why

This plugin runs **inside an agent host**. The agent rewrites files while the
user is looking at them, and nothing in the plugin knew: there was no
`fs.watch` anywhere, `read()` returned no revision, and `write()` overwrote
whatever was on disk. The concrete failure: the agent writes `src/app.ts`, the
user has the same file open with local edits, presses Ctrl+S — **the agent's
write is gone**, silently, with no message. A read-only survey turned up three
more P0-class problems in the same area (blocking sync I/O, unbounded reads,
non-atomic writes).

### Host half (`lib/index.js`, `lib/types/typert.host.js`)

1. **mtime travels with every read and save.** `read()` returns `mtimeMs`;
   `write(path, content, expectedMtimeMs)` refuses with `CONFLICT` when the
   on-disk revision moved since that read. `-1` explicitly opts out (brand-new
   file, or a deliberate overwrite).
2. **All fs work is async.** `node:fs/promises` replaces `readFileSync` /
   `readdirSync` / `statSync` / `writeFileSync` / `renameSync` / `rmdirSync` /
   `unlinkSync` / `mkdirSync`. The methods were already declared `async` but
   blocked the event loop for their whole duration — the same loop DSH itself
   runs on. The sync imports that remain belong to the one-shot VSCode profile
   probe.
3. **`list()` uses `readdir({ withFileTypes: true })`** — one syscall instead of
   a `stat` per child. That per-child `stat` existed only to compute `size`,
   which the client never read, so `size` is gone from the DTO. Symlinks still
   resolve via `stat` to preserve the old follow-the-link behaviour.
4. **Size guard on `read`.** `MAX_READ_BYTES = 8 MiB`; larger files fail with
   `TOO_LARGE` and a human-readable size. Previously the whole file was read into
   memory and shipped over the RPC as a single JSON string.
5. **Atomic writes.** Content goes to a sibling `.<name>.dsh-<pid>-….tmp` and is
   then `rename`d over the target, so a crash mid-save cannot leave a truncated
   file behind.
6. **`rename` refuses to clobber.** Worth calling out: `fs.rename` *replaces* an
   existing file on Windows, so dropping the old existence check would have
   silently destroyed the destination. Caught in review, restored.
7. **New `changes(since)` RPC.** A debounced `fs.watch(root, { recursive: true })`
   feeds a small ring buffer of touched paths that the client polls. Events under
   `node_modules/` and `.git/` are filtered out. `persistent: false`, so the
   watcher never holds the host process open.

### Contract

Both faces updated together — host and client must agree or the gateway drops the
strict definition: `TOO_LARGE` + `CONFLICT` fail codes, `ReadOk.mtimeMs`,
`WriteOk` (write now returns the new revision), `ChangesOk`, and a `numParam`
codec helper.

### Client half (`lib/client.js`)

- Buffers carry `mtimeMs` and `stale`; `BuffersStore.load`/`markSaved` thread the
  revision through, `markStale` flags an externally-changed dirty buffer.
- `saveActive` sends the revision it read; on `CONFLICT` it says so instead of
  overwriting.
- `FilesView` owns a single `changes()` poller (2.5 s) and publishes one
  `external` batch per poll: `paths` for open buffers, `dirs` (each path plus its
  parent) for the tree. Collapsed directories cost nothing; only expanded ones
  re-list, and only when they appear in the batch.
- A clean buffer whose file changed on disk is **silently reloaded** — that is
  what an agent rewriting a file you are merely looking at should look like. A
  dirty buffer is never touched; it gets a banner with two explicit exits:
  「加载磁盘版本」 and 「强制保存（覆盖磁盘）」.

### Bugs the verification caught

| Bug | Impact | Fix |
|---|---|---|
| `for (const path of watchPending)` over a `Map` | every change entry carried a `[key, value]` **array** instead of a path — the whole feed was garbage | iterate `watchPending.keys()` |
| `useSyncExternalStore` subscribed to `?.content` only | `markStale` flips a flag without touching the text, so the snapshot never changed and React skipped the re-render — **the stale banner never appeared** | subscribe to the buffer entry object |
| No overwrite exit for a stale dirty buffer | the conflict guard became a dead end — such a buffer could never be saved at all | added 「强制保存（覆盖磁盘）」 |
| `fs.rename` clobbers on Windows | renaming onto an existing path would have destroyed it | explicit destination check restored |

### Verified

- `D:/开发/_diag/dsh-fs-fixture.js` — **46 assertions / 0 FAIL**. Copies
  `lib/index.js` into a sibling module (with a `volatile()` shim for the Cordis
  schemastery extension) and drives the real service prototype against temporary
  trees: dirent listing (incl. symlink-follow, and `size` being gone),
  `TOO_LARGE`, `IS_DIR`, `IS_BINARY`, mtime round-trip, `CONFLICT` with disk
  content unchanged, `-1` opt-out, no temp-file leftovers, rename no-clobber,
  mkdir/unlink semantics, and the change feed (fires, advances, consumes,
  filters `node_modules`).
- `D:/开发/_diag/dsh-p0-e2e.js` — **22 assertions / 0 FAIL / 0 console errors**
  against a real `dsh web` + Chromium: tree self-refresh, clean-buffer
  auto-follow, dirty-buffer staleness, save blocked with the disk left intact,
  force save, normal save recovery, reload-discards-edits, oversized-file refusal.
- Regression — `dsh-vscode-fixture.js` 57/0 and `dsh-vscode-regress.js`: Addendum
  3 still intact.

Backups: `lib/{client,index}.js.bak-20261012-p0` and
`lib/types/typert.host.js.bak-20261012-p0` (state before this round).


## Addendum 5 — Localized RPC error copy (2026-10-12)

**Reported**: 「打不开文件」on the desktop app.

**Diagnosis** (CDP probes against the real desktop session): opening text files
worked fine — the actual friction was clicking a binary file (`.pyc`, `.png`,
`.apk`, `.tar.gz`): the host's `IS_BINARY` guard correctly refused the read, but
the error banner showed the raw English host message
("file looks binary and cannot be edited"), which reads as "broken" rather than
"this file type is intentionally not editable".

**Fix** (client only, no host/contract change):

- New dictionary keys `errIsBinary` / `errTooLarge` / `errNotFound` /
  `errOutOfRoot` (zh + en).
- New module-level `describeRpcError(error, t)` mapping the **stable** `error.code`
  to localized copy (`IS_BINARY`, `TOO_LARGE`, `NOT_FOUND`, `OUT_OF_ROOT`,
  `CONFLICT`); unknown codes fall back to the host message, which may carry
  useful IO detail.
- Applied at the three failure exits that surface raw host messages:
  `openPath`, `saveActive` (non-CONFLICT branch), `reloadActive`.

**Verified** (desktop app restarted on the new client, CDP):

- Clicking `_rec_ff_test.cpython-311.pyc` → banner
  「二进制文件无法在编辑器中打开（如 .pyc、图片、压缩包等）」within 800 ms, stable.
- Clicking `PATCH-NOTES.md` → opens fully with Markdown token highlighting,
  multi-tab intact, 0 page errors.
- Backup: pre-change state is `lib/client.js.bak-20261012-p0-done`.

---

## 2026-10-13 — One workspace ⇄ one folder (workspace registry picker)

### User ask

「一个工作区对应相对应的文件夹」 — the explorer's workspace picker must list
every left-rail workspace with its OWN folder, and switching must re-root the
tree at that workspace's directory (no more "everything mixed together").

### Root cause of the old behaviour

`collectWorkspaces()` guessed workspaces from the loaded session snapshot's
`cwd`s — which usually held exactly ONE entry, so the picker degenerated to
"current session folder only". The authoritative data was always there: the
host keeps durable workspace records (`data/storages/workspace.json`) behind
the `ctx.workspaceRegistry` service (`@deepseek-ai/dsh-workspace`), each with
`{ id, path, title, sessionIds }`.

### What changed

Host (`lib/index.js`):

- New `@Remote` method `listWorkspaces()` on the `explorerFs` service. It
  resolves `ctx.workspaceRegistry` WITHOUT adding it to the plugin's cordis
  `inject` list — a hard inject would keep the whole explorer from activating
  on any profile that does not ship the workspace bundle. The read goes
  through `ctx.reflect.get("workspaceRegistry", false)` (Cordis' documented
  read-without-inject path) with a plain `ctx.workspaceRegistry` probe first.
  Registry absent → `{ ok: true, workspaces: [] }`, never a failure.
- Compiled-decorator plumbing for the new method (`_listWorkspaces_decorators`
  + the matching `__esDecorate` call) — without it the Gateway answers 404 for
  `/api/explorerFs/listWorkspaces` (verified: that exact 404 before the fix).

Client (`lib/client.js`):

- Strict typert contract for the new RPC (`WorkspaceEntrySchema`,
  `ListWorkspacesOkSchema` + `invocation("listWorkspaces", ...)` + `api.listWorkspaces`).
- `collectWorkspaces()` is now async: host registry entries first (durable
  order = left-rail order, label = workspace title), session cwds still unioned
  as fallback, current root appended last.
- Picker menu is filled asynchronously with a token guard (`wsMenuToken`) so a
  stale late result can't populate a menu the user already closed; a
  "reading workspaces…" hint shows while the fetch is in flight.
- The entry matching the current root is highlighted (`data-current` +
  brand-coloured leading ✓), and every entry shows its own absolute folder
  path under the title — that IS the "one workspace ⇄ one folder" contract.
- The picker button now reads the workspace TITLE (left-rail name) instead of
  a path basename, and the dictionary gained `wsOpenOther` / `wsWorkspaces` /
  `wsLoading` / `wsPrompt` (zh + en) so the menu is fully localized.

### Session-root pin (kept, already correct)

`installSessionRootPin` still re-roots the explorer to the current session's
cwd whenever the session changes — i.e. opening a session of another left-rail
workspace previews THAT workspace's folder automatically. The picker covers
the manual jump; the pin covers the automatic follow.

### Verification (CDP, headless Chrome over the debug port, 0 pageerror)

- `workspaceRegistry: 3 entries` in the client log (was: 1 session cwd).
- Picker lists exactly the three left-rail workspaces, each with its own path:
  Workspaces → `D:/30651/DeepSeekHarness/Workspaces`,
  2026数学建模 → `D:/phpstudy_pro/WWW/2026数学建模`,
  WWW → `D:/Project_apps/phpstudy_pro/WWW`.
- Switching to each entry re-roots the tree (picker title + breadcrumbs +
  tree rows all follow; 39 real entries under 2026数学建模).
- Double-clicking `2026数学建模.code-workspace` opens the Monaco editor with
  tab strip, path bar and the status bar (`plaintext | 1:1`).
- Backups: `lib/client.js.bak-20261013-wsmap`, `lib/index.js.bak-20261013-wsmap`.

---

## 2026-10-13 — One session ⇄ one folder (per-session folders + subagent seat)

Follow-up to the workspace⇄folder change. The user's model is: *a session is a
sub-workspace*, so every session owns its own folder instead of every session
sharing the bare workspace root.

UX summary: open a session → the file tree is already rooted at that session's
own folder. Folders are named after the session title; two sessions sharing a
title get `标题` / `标题-2`. The name is bound to the session id and persisted,
so renaming a session later never moves its files.

### Host — `lib/index.js`

New region `per-session folders (PATCH 2026-10-13)`:

- `SESSION_DIR_MAP = ".dsh/session-dirs.json"` — durable `sessionId → {name,
  createdAt}` map at the **workspace** root.
- `sessionDirName(title, sessionId)` — Windows-safe single path segment:
  `<>:"/\|?*` + control chars → space, trailing dots/spaces stripped, 60-char
  cap, reserved device names (`con`, `lpt1`, …) prefixed with `_`, empty result
  falls back to `session-<id8>`.
- `readSessionDirMap` / `writeSessionDirMap` — missing or corrupt file reads as
  an empty map (never throws); writes are a whole-file rewrite of
  `{version:1, dirs}`.
- **`sessionDirBase(self, explicit)`** — the anchor resolver. This is the
  non-obvious part: once a session is pinned the live root IS the session
  folder, so anchoring the map on `self.root` would read
  `<workspace>/<session>/.dsh/session-dirs.json` and mint a *nested* family of
  folders on every sync. The caller passes the session cwd (the workspace);
  it wins whenever it is a real directory, else we fall back to the live root.

Two new remotes (both take an explicit `base`):

- `resolveSessionDir(sessionId, title, base)` → `{ok, name, path, minted}`.
  Reuses an existing mapping; otherwise mints `title`, deduping against the
  other names in the map with `-2`, `-3`, … and `mkdir -p`s the folder.
- `listSessionDirs(base)` → `{ok, dirs:[{sessionId, name, path}]}` for the
  picker's session rows.

Both needed the compiled-decorator trio (`_resolveSessionDir_decorators = [Remote]`
+ `__esDecorate(this, null, …, {kind:"method", name:"resolveSessionDir", …})`);
without the decorator the route 404s — typert derives
`/api/<service>/<method>` from decorator metadata.

`resolveFallbackModel(llm)` now logs the provider list it saw and which
`provider/model` it picked, so a failed subagent call can be traced to the
model route rather than to the panel.

### Client — `lib/client.js`

**Where the session id comes from (the crux).** The previous
`installSessionRootPin` read `sessions.list.getSnapshot().current`. That field
does not exist in this build — the snapshot is
`{ids, byId, phase, projectionsBySession}` — so `current` was always
`undefined` and the pin silently never fired. A plugin also cannot read
`ctx.sessions` at all (no `sessions` in its inject list → cordis throws).

The host, however, hands every `conversation.view` occupant both
`sessionId` and a `useSessions` selector already bound to the session list
store. That is now the single source of truth:

```js
// registration
}, (props) => jsx(FilesView, { ..., sessionId: props.sessionId, useSessions: props.useSessions }))

// FilesView
const selectSession = props.useSessions ?? (() => void 0)
const session = selectSession((list) => list?.byId?.[sessionId])
const sessionCwd = typeof session?.cwd === "string" ? session.cwd.trim() : ""
const sessionTitle = typeof session?.title === "string" ? session.title.trim() : ""
```

`sessionId` and `useSessions` must be **forwarded explicitly** — the render
callback builds the `FilesView` props object by hand, so forgetting one
silently degrades the selector to its no-op fallback.

- `installSessionRootPin` is gone; replaced by `useSessionRootPin(sessionId,
  sessionCwd, sessionTitle, api, reload)`, a hook owned by `ExplorerPanelInner`
  (which mounts exactly when the explorer view is on screen — no mode flag
  needed).
  - No durable title yet ⇒ pin to the plain workspace cwd, so a brand-new
    session does not litter the workspace with `session-xxxxxxxx` folders.
  - Dedupe against **what the pin last applied**, not against the live root, so
    a folder the user opened by hand is left alone until the session's own
    folder really changes.
  - `holdPin()` (returned by the hook, called by `setRootTo`) suspends the pin
    after hand-driven navigation; the hold resets when the session changes.
  - A generation counter invalidates in-flight work on session change/unmount.
- `ExplorerPanelInner` listens for `file-explorer:root-changed` and re-reads
  root + listing, so a root the pin moved is reflected in the tree.
- Workspace picker grew a second level: under each workspace, its already-minted
  session folders render as indented `wsMenuSession` rows (tick + `会话文件夹`
  tag + `data-session-id`). The current folder is highlighted; clicking one
  roots the explorer there and holds the pin. `collectWorkspaces` fetches them
  per workspace via `listSessionDirs(workspacePath)`.
- The live root is no longer blindly appended as a picker entry: a root nested
  inside a known workspace already has a row, so it is only surfaced when it
  lies outside every workspace.
- New dictionary key `wsSessionFolder` (zh: 会话文件夹 / en: Session folder).
- New CSS for `.workspaceMenuItem.wsMenuSession` (indent + secondary weight,
  brand-coloured when current).

### Verification

Host logic — deterministic unit test (`D:/开发/_diag/_unit-sessiondir.js`)
slices the shipped source out of `lib/index.js` and runs it against real fs
(28 assertions, 28 pass): name sanitising (illegal chars, trailing dots,
reserved device names, 60-char cap, empty→id fallback), anchor resolution
(explicit wins / missing / empty / relative all fall back), mint → reuse →
`-2` → `-3` dedupe, **anchor stability** (root already inside a session folder
must not nest a second `.dsh`), `listSessionDirs` per workspace, and corrupt-map
/ empty-id resilience.

Client E2E (CDP over the debug port, 0 pageerror):

```
header     : DevServerManager (1)
hostRoot   : D:/30651/DeepSeekHarness/Workspaces/DevServerManager (1)
picker     : DevServerManager (1) ▾
crumbs     : D:/30651/DeepSeekHarness/Workspaces/DevServerManager (1)
panels     : 1   eaPanel: 1
errors     : 0
```

- `Workspaces/.dsh/session-dirs.json` minted folders for five real sessions
  (`修改 GitHub 文件浏览器插件`, `DevServerManager (1)`,
  `Add File Explorer DSH Plugin`, `检查小说系统报错上线`, `小红书隐蔽发布助手`).
- Picker renders workspace rows + their session folders as children, current
  one ticked.
- Subagent seat follows the root, so each session's subagents now live in
  `<workspace>/<session>/.dsh/subagents/` — the panel for a fresh session shows
  the empty-state hint instead of another session's agents.

### Backups

- `lib/client.js.bak-20261013-wsmap`, `lib/index.js.bak-20261013-wsmap`
  (pre-workspace-map baseline, still the rollback point for both changes).

### Known limitations / notes

- **Subagent model route**: the panel passes the open session's projected
  `modelSelection`; when that reads empty the host falls back to the first
  provider that advertises models. If that provider's endpoint is down the call
  surfaces `Upstream request failed: Endpoint is unavailable.` — a provider
  configuration matter, not panel logic (the error is now rendered in the panel
  and the picked provider is logged on the host).
- Sessions created before this change have no folder until they are opened
  once; the folder is minted lazily on first pin.
- Subagents created while the root was the bare workspace stay in
  `<workspace>/.dsh/subagents/` (old data is never moved); only new ones are
  per-session.
- Sidebar minimum width is still 264px and lives inside `app.asar`
  (`dsh-client-ui-layout`) — unchanged, as agreed.

## 2026-10-13 (later) — Subagent model follow-up fixed; the seat really talks

The "Endpoint is unavailable" note above is now **resolved** — it was never a
provider configuration matter. Two client bugs compounded so the panel always
sent an empty provider/model, and the host fell back to the first routable
provider, which happened to be a dead endpoint.

### Root causes (both in `lib/client.js`)

1. `EditorAgentPanel` read the model off `snap.current` — the same phantom
   field that killed `installSessionRootPin`. This build's list snapshot is
   `{ids, byId, phase, projectionsBySession}`; there is no `current`, so the
   read silently produced `""` every time.
   Fix: the panel now receives `sessionId` + `useSessions` (forwarded through
   `FilesView`, exactly like the root pin) and reads
   `byId[sessionId].projectionValues.modelSelection` through the host selector.
2. Even with the right row, the old code read `selection.provider` /
   `selection.model` — but the projection is shaped `{ lastUsed, next }`, so
   both reads were `undefined` regardless. Fix: prefer `next`, fall back to
   `lastUsed`, and read `picked.provider` / `picked.model`.

The probe that cracked it (CDP, dump of the live session row):

```json
{"sel":{"lastUsed":{"provider":"qoder-global","model":"qfmodel"},
        "next":{"provider":"qoder-global","model":"qfmodel"}}}
```

### Also fixed in this pass

- **Stale selection**: a remembered `activeId` could point at an agent that no
  longer exists under the current root (created before the per-session pin, or
  deleted outside the panel). Every mount then failed with
  「文件不存在（可能已被移动或删除）」. `loadAgents` now reconciles: keep the
  remembered id only if it still exists, otherwise select the newest agent
  (or none). This also fixes the single-agent case — the tab strip only
  renders for ≥2 agents, so a sole agent could previously never be selected.
- **Error folding**: upstream model failures arrive as the provider's raw JSON
  (a 429 throttled body ran 400+ chars of nested escapes straight into the
  one-line banner). New `summarizeError` maps the common case to a localized
  「上游模型限流（HTTP 429）」 (`errUpstreamBusy`, zh/en) and clips anything
  else at 240 chars. Unit-checked 13/13 (`D:/开发/_diag/_unit-error-text.js`).
- Dead code: `optionalService` removed (both former callers now use the host
  selector); the temporary `[file-explorer] fallback model` / `subagent *`
  host logs removed (a single `console.warn` remains on the failure path).

### Verification

- Host unit: `resolveFallbackModel` still compiles/behaves (fallback retained
  for blank sessions).
- RPC round-trip with the session model — real reply, assistant turn persisted:

```json
{"ok": true,
 "reply": "我负责协助编辑工作区中的文件和目录，处理代码修改、文件操作等任务。",
 "messageCount": 1}
```

- Full UI path (reload → files view → seat → create → type → 发送):
  model chip `qfmodel` (title `qoder-global · qfmodel`), user turn rendered,
  assistant reply rendered, `error: null`, **0 pageerror**.
  Screenshot: `D:/开发/_diag/subagent-model-follow.png`.
- One intermittent `429 … soft_rate (isQueued)` was observed from the qoder
  upstream between runs — transient provider throttling, now displayed as the
  friendly one-liner instead of raw JSON.

### Known limitations

- Old subagents under `<workspace>/.dsh/subagents/` stay there (never moved);
  they appear only when the explorer root is the bare workspace. Probe
  leftovers from this session were cleaned by hand (2 empty transcripts +
  index reset).

## 2026-10-13 (latest) — A session folder that is never an empty shell, and a rail that goes to 176

Two threads closed out: the session folder finally *says* what it is and holds
what belongs to the session, and the native left rail's 264 px floor is gone.

### Why the session folder looked wrong

The user's complaint, in order: "会话里面怎么不是相对应的文件夹" → "会话不应
该有对应文件吗？" → "是会话文件，不是全部工作区文件". Three readings were
tried before the right one landed:

1. **"直接就是项目文件夹"** — root the tree at the whole workspace. Reverted:
   that is exactly the 大杂烩 the user started by rejecting.
2. **"会话自己的工作目录"** — point the session's `cwd` at its folder. Dead on
   arrival: ACP has no cwd-update route for a live session (`session/new`
   carries cwd; `withAdditionalDirectories` explicitly does NOT change cwd),
   and pointing cwd at an empty subfolder would blind the session's own agent.
3. **The right reading**: a session's folder holds *the session's own things* —
   its notes, its artifacts, its subagent memory — and says so out loud.
   Workspace source stays in the workspace because every session shares that
   cwd and a per-session copy would rot instantly.

Two facts shaped the implementation:

- **The plugin has `write` / `unlink` / `rename`**, so mirroring DSH's private
  per-session store (`data/sessions/--<ws>--/session-<id>/`) as a junction would
  hand the user a deletable copy of their own session history. Rejected.
- **zstd decode of the transcript is not worth it**: `node:zlib` has
  `zstdDecompressSync` on system Node 22 but Electron's Node may not, and the
  conversation is already rendered in the chat panel. Cost >> value.

### Host (`lib/index.js`) — `seedSessionDir`

`resolveSessionDir` now seeds the folder **on every resolve** (not only on
mint), so folders minted before this change heal themselves the next time their
session opens. Seeded, never overwritten:

| path | what |
| --- | --- |
| `README.md` | what this folder is, the session id / workspace / created-at, and *why it is not the whole workspace* |
| `notes.md` | the session's own scratch notes |
| `artifacts/` | what the session produces |

An existing `README.md` / `notes.md` is the user's text and is left alone;
seeding failure is caught and warned, never allowed to break the pin.

### Client (`lib/client.js`) — the ownership strip

The pin roots the tree at the session's folder *silently*, and a silent pin is
indistinguishable from "opened the wrong place" — which is exactly how it was
read. A one-row strip now sits under the breadcrumbs:

```
[会话] DevServerManager (1)            [工作区]
```

- Badge `会话` + the session title (from the same `sessionTitle` the pin uses).
- `data-file-explorer-session-strip="self"|"elsewhere"`.
- The single button does the one jump that matters: out to the workspace while
  the tree IS the session folder, back to the session folder when the user has
  browsed away (via `setRootTo`, which also `holdPin()`s, so it sticks).

`useSessionRootPin` gained an `onResolved` callback (kept in a ref so it never
enters the effect deps and re-mints the folder map), reporting the resolved
folder — empty when it could not resolve one, which is when the strip hides.
Plus 4 locale keys (`sessionFolderBadge` / `Unnamed` / `Self` / `Workspace`) and
a `.sessionStrip` CSS block. A dangling JSDoc fragment left by the picker
cleanup was removed while in the neighbourhood.

### The rail floor: the asar that actually matters

`clampWidth(sidebar, 264, 420)` was already relaxed in
`data/profiles/node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js` —
and it did **nothing**, because that file (24 259 bytes) is a different build
from the one the renderer loads. The real one is inside the desktop app
archive:

```
D:/30651/DeepSeekHarness/Desktop/app/resources/app.asar
  dsh/node_modules/@deepseek-ai/dsh-client-ui-layout/lib/client.js
  size 31732, entry offset 17784184, abs 21176248  (dataStart = 8 + headerSize)
```

Both `clampWidth(sidebar, 264, 420)` and `clampWidth(px, 264, 420)` became
`…, 176, 420)` — same byte length, so an in-place write keeps the archive
header valid with no repack. Backup:
`app.asar.bak-20261013-023743`. Revert:

```
copy "D:/30651/DeepSeekHarness/Desktop/app/resources/app.asar.bak-20261013-023743" ^
     "D:/30651/DeepSeekHarness/Desktop/app/resources/app.asar"
```

Note: `asar` stores entry offsets as **decimal strings**, not uint32 — the
first parse attempt crashed on exactly that. An app update overwrites this
patch; re-run `_asar-patch-rail.py`.

### Verification (fresh launch, CDP)

Unit — `_unit-session-seed.mjs`, functions *extracted from the shipped file*:
**20/20** (name sanitising incl. reserved devices, README/notes content,
idempotence, user edits never clobbered, empty shells healed).

End-to-end — `_e2e-session-folder.cjs`:

| check | result |
| --- | --- |
| strip present, badge `会话`, name = session title | PASS |
| state `self`, jump button `工作区` | PASS |
| tree rows = `.dsh / artifacts / notes.md / README.md` | PASS |
| disk: folder seeded | PASS |
| jump workspace → 59 rows, back → 4 rows, round-trip | PASS |
| tree drag left -120 → -120, right +140 → +140 | PASS |
| pageerror / plugin warnings | none |

Rail — `_e2e-rail-fixed.cjs`: start 176, drag -320 → **176** (clamped, was 264),
+160 → 336, -160 → 176, +600 → **420** (upper bound intact), 1:1 tracking, then
parked at 280. Screenshots: `e2e-session-folder.png`, `e2e-rail-176.png`.

A false alarm worth recording: the first probe's `empty: true` was
`[class*="empty"]` matching the **editor's** "从左侧目录树打开文件" placeholder
(`VX-wEW_empty`), not a "工作区为空" banner. Selector too loose, no bug.

### Known limitations

- The four folders mapped before this change (`修改 GitHub 文件浏览器插件`,
  `Add File Explorer DSH Plugin`, `检查小说系统报错上线`, `小红书隐蔽发布助手`)
  stay empty until their session is opened once — seeding runs on resolve.
- `artifacts/` starts empty; nothing moves session output there automatically.
- An app update replaces the asar and resets the rail floor to 264.

## 2026-10-13 (later still) — 「会话里还是没有相关文件」→ the session's own files, from its own log

The seeding above answered "which folder is this?" and still missed the actual
question: **where are the files for this conversation?** README / notes /
`artifacts/` are scaffolding, and scaffolding is not related files.

### The evidence that settled it

DSH writes every event of a session into its own store:

```
data/sessions/--<encoded cwd>--/<sessionId>/session.v4.jsonl.zstd
```

Decoding one (6.4 MB → 3824 zstd frames → 30 MB, 12 918 events) showed two
event types that *are* the session's file set:

| event | carries |
| --- | --- |
| `tool/call` (`read` / `edit` / `write` / `read_image`) | the file acted on |
| `deliverables/presented` | the files handed to the user, **each with the description the session wrote for it** |

`workspace/changes` exists but carries only `{turn}` — no paths — so the log is
the only per-session attribution there is. `pwsh` commands are deliberately NOT
parsed: a `Get-ChildItem` in shell text is not "the session's file", and
guessing would fill the list with noise. Measured cost across all 43 real
sessions: 5–270 ms each; sessions that did real work yield 8–238 produced
files (median 0 only because 22 of 43 are near-empty config sessions).

### Host (`lib/index.js`) — new region "session related files"

- **`findSessionsRoot()`** — walks up from `import.meta.url`,
  `process.resourcesPath`, `process.cwd()` looking for a directory named
  `data/sessions` (or `sessions`) that *also* contains `--…--` buckets. Covers
  a plugin linked out of a dev checkout and one installed into a profile.
- **`locateTranscript()`** — the bucket name escapes non-ASCII as `~HEX` and is
  version-dependent, so it is never re-derived: the session id (a UUID) is
  looked up under every bucket instead.
- **`decodeZstdFrames()`** — DSH appends one zstd frame per flush, so
  decompressing the file whole yields ONLY the first frame (280 bytes of
  session header out of 6.4 MB). Splitting on the frame magic and decoding each
  frame recovers everything. Electron's Node is 24.18.1, which has
  `zstdDecompressSync` (verified, not assumed).
- **`extractSessionFiles()`** — one record per file, `delivered > written >
  edited > read`, descriptions kept from whichever event had one, `node_modules`
  / `.git` excluded, non-absolute paths dropped. Cached against the
  transcript's `size:mtime` in `<session folder>/.dsh/related.json`.
- **`mirrorRelatedFiles()`** — mirrors *produced* files (read-only files stay
  in the index only; a session that read 393 files must not bury the dozen it
  wrote) as **hardlinks** under `相关文件/`, organised by workspace-relative
  path, `_外部/` + flattened name for anything outside the workspace.
- **`relatedIndexText()`** — `相关文件.md`, the readable index that says *why*
  each file exists (the deliverable descriptions) and that the mirror entries
  are hardlinks to the real files.
- New RPC `sessionFiles(sessionId, base)` + decorator plumbing, following the
  same pattern as `resolveSessionDir`.

Hardlink safety, stated once because it was got wrong first: deleting a
hardlink removes only that name, so dropping an entry that left the set is
always safe. An mtime guard would be WRONG here — the mirror shares its inode
with the source, so every ordinary agent edit looks like "the user touched it"
and nothing would ever be cleaned up. The one unsafe case is a source that has
since been deleted, where the mirror entry may be the last copy of that
content; those entries are kept. (76 of this session's 238 produced files are
exactly that — `Worktree\_*.mjs` scratch scripts the session deleted.)

### Client

`useSessionRootPin` now gathers the session's files **before** the first tree
read, so the folder never paints as an empty shell that fills in a beat later.
The ownership strip gained the counts:

```
[会话] DevServerManager (1)    产出 238 · 相关 252    [工作区]
```

### Verification

Unit — `_unit-session-files.mjs`, functions extracted from the shipped file,
run against the REAL decoded transcript: **38/38** (delivered files found with
their descriptions, role merging, relative/external paths, bad-JSON tolerance,
hardlink identity via `nlink`/`ino`, idempotent re-link, entries dropped when
they leave the set, source-deleted entries kept).

Offline sweep — `_scan-session-files.mjs` over all 43 sessions.

End-to-end — `_e2e-related-files.cjs`, switching to `DevServerManager (1)`:

| check | result |
| --- | --- |
| `explorerFs/sessionFiles` → 200 | PASS |
| strip `产出 238 · 相关 252` | PASS |
| `相关文件/DevServerManager/…` mirror populated (162 links) | PASS |
| manifest: 6/6 same inode, 6/6 byte-identical to source | PASS |
| `相关文件.md` (25 857 chars) with deliverable descriptions | PASS |
| 76 un-mirrored = files deleted from disk since | accounted |
| mirrored `CHANGELOG.md` opens in the editor | PASS |
| pageerror / plugin warnings | none |

Screenshots: `e2e-related-files.png`, `e2e-related-expanded.png`,
`e2e-related-open.png`.

### Known limitations

- Files written through `pwsh` / python heredocs are invisible to this
  extraction (the log has no path-attribution event for shell writes). A
  session that built everything in shell shows a short list; the count in the
  strip makes the coverage visible rather than hiding it.
- `相关文件/` is rebuilt on session open, so a link broken by an atomic-replace
  write during the session is stale until the next open.
- Reading the log caps at 96 MB of compressed input.

## 2026-10-13 (latest) — The shell gap closed (+75 files), and the VSCode keys arrive

Two threads: the extraction gap the previous round admitted to (files written
through shell commands were invisible), and the first real slice of VSCode
muscle memory — Ctrl+P above all.

### Part 1 — shell-written files now make the list

In the DevServerManager transcript 688 of 2407 tool calls (29%) were shell.
Every file written with `Set-Content` / `Out-File` / `>` was invisible, because
the extractor reads tool *arguments* and a command string is not a path.
Measured first (`_probe-shell-gap*.mjs`, `_probe-relpaths.mjs`), then built:

**Gate one — text** (`extractShellCandidates`). The command must contain a
write verb (`Set-Content` `Add-Content` `Out-File` `New-Item` `Copy-Item`
`Move-Item` `Rename-Item` `Export-*` `Set-ItemProperty` `tee`, or `>` not
followed by `&`/`$` — which keeps `2>&1` and `2>$null` out). From qualifying
commands it takes absolute Windows paths and, NEW this round, relative ones —
resolved against the call's own `workdir` (162 of 688 calls carry one), else
the workspace. URLs (`https://…` matches `s://…`), `$var` interpolations and
globs are dropped. One candidate per file, remembering EVERY call time that
named it.

**Gate two — disk** (`verifyShellCandidates`). A path named in a command
proves nothing. What decides it is the file's mtime landing just AFTER one of
the calls that named it (+5 s grace … +5 min window):

| candidate in one real session | why it is rejected |
| --- | --- |
| `Get-ChildItem 'D:\ws'` | no write verb — never a candidate |
| a test file edited on day one, run on day three | mtime is 8 min BEFORE the call — inside the session, but not written by it |
| `_acl_probe.txt` via `Out-File` | mtime 11 s after the call — confirmed |
| `Worktree\_*.mjs` scratch scripts | deleted since — no file, no entry |
| `C:\Program` (truncated `Program Files` path) | stat fails |
| `s://registry.npmjs.org` | dropped as a URL |

Checking "inside the session's lifetime" instead is NOT enough — the day-one
edit / day-three run case is exactly why the per-call anchor replaced the
first draft's session-wide window. New hosts wiring this up should keep the
per-call anchor even though the session window looks simpler.

**Merge** (`mergeShellFiles`): files reached through both paths appear once;
the richer record wins and gains a `via: "shell"` note, which the index shows
as 「写入」 (vs 「新建」 for tool writes) plus a footnote explaining the
evidence chain.

Results across all 41 sessions: **1661 → 1736 files (+75), 7 sessions
benefit**, the biggest one +63 (`xhs-ops/*.json` — a session that scraped
through shell). DevServerManager itself gains nothing, honestly: its 748
edits went through the `edit` tool and shell only built/tested.

Hard-won test-harness lesson (third time): the scanner that extracts these
functions from the shipped bundle must track `//` and `/* */` comments —
`quickScore`'s doc comment contains `a/b.ts`, and treating `/*` as a regex
start made the scan swallow the rest of the file. Character classes inside a
regex also matter: `SHELL_PATH_TOKEN` has a `;` INSIDE `[...]` and a `/`
inside `[\\/]`.

### Part 2 — the VSCode keys

| key | action |
| --- | --- |
| **Ctrl+P** | quick open: fuzzy file jump over a fresh index |
| Ctrl+B | hide / show the file column (persisted) |
| Ctrl+Shift+E | focus the tree so arrows work there |
| Ctrl+W | close the active tab (same dirty-check as the ✕) |
| Ctrl+Tab / Ctrl+Shift+Tab | cycle tabs, wrapping |
| Ctrl+PageDown / PageUp | same, the other VSCode binding |
| Ctrl+1…9 | activate the Nth tab |
| 主题 menu → 小地图 | Monaco minimap on/off (persisted) |

**Quick open needs a host walk** — the tree is lazy, useless for jump-to-name.
New RPC `listFiles(root)`: flat relative list, bounded (20 000 entries /
depth 16 / `truncated` reported, not hidden), skips `node_modules` / `.git`,
one `stat` per file for size+mtime. The overlay opens BEFORE the walk lands
("building index…" beats a frozen second); results cache 30 s. Ranking is
local subsequence matching with the score weighted by where the match lands —
basename hits (×10) outrank directory hits (×1), contiguous runs +8, segment
starts +6, and an empty query ranks by path SHALLOWNESS, not alphabet
(`quickScore`/`quickFilter`, 19/19 unit against the plugin's own tree:
"client" puts `lib/client.js` above its `.bak` copy; "pn" finds
`PATCH-NOTES.md`).

**Key handling is on `window`, CAPTURE phase** — Monaco stops propagation for
keys it owns, so a bubble-phase listener never sees Ctrl+P once the editor has
focus. Shift combos are handled first and everything else bails on
`shiftKey`, leaving Ctrl+Shift+F (format) and Monaco's own chords alone.
Before shipping Ctrl+W, the app archive was grepped for `CmdOrCtrl+W` — zero
hits, so no Electron accelerator steals it.

Minimap rides the existing appearance store (`minimap: boolean`, persisted
with the theme blob, `updateOptions` on change — no editor rebuild) and is
OFF by default, as before.

### Verification (fresh launches, CDP)

Unit — `_unit-shell-gap.mjs` **42/42** (verb gate incl. `2>$null`/`2>&1`,
token shapes, per-call mtime window on real temp files, merge/dedup, real
transcript 688 shell calls in 41 ms); `_unit-quickopen.mjs` **19/19**.

Sweep — `_scan-shell-coverage.mjs` over all 41 sessions: +75 files, 7
sessions, biggest +63.

End-to-end — `_e2e-vscode-feel.mjs` **16/16**: Ctrl+P opens with focus in the
input (index 167 files), "readme" → 4 rows topped by `README.md`, Enter opens
it in the editor; Ctrl+B hides/restores the tree; Ctrl+Tab cycles; Ctrl+W
closes 3 → 2; 0 pageerror, 0 plugin warnings. `_e2e-minimap.mjs` **7/7**:
chip flips, `.minimap` 0 → 48 px → 0. Screenshots: `e2e-vscode-feel.png`,
`e2e-minimap.png`.

### Known limitations

- Relative paths resolve against the call's `workdir` or the workspace only;
  a command that `cd`s first and writes relatively afterwards is invisible.
- Files written by a command's CHILD process (npm scripts, node scripts) only
  count when the command itself names the path — the log has no
  path-attribution for indirect writes.
- Quick-open caches 30 s: a file created seconds ago may need one more
  Ctrl+P.
- Ctrl+W's dirty-check uses `window.confirm`, inherited from the tab ✕.

## 2026-10-13 (latest) — Renamed to `dsh-vscode`

The plugin is now called **`dsh-vscode`**. Everything that is an *identity* moved
with it; everything that is a *storage key* was carried over with a migration.

### What changed

| Surface | Before | After |
| --- | --- | --- |
| Directory | `Workspaces/dsh-plugin-file-explorer` | `Workspaces/dsh-vscode` |
| npm name | `@supanexus/dsh-plugin-file-explorer` | `dsh-vscode` |
| Cordis id (`cordis.patch.yml` `id` = exported `name`) | `supanexus-file-explorer` | `dsh-vscode` |
| Client module id (`__ModuleLoader__.load`) | `@supanexus/dsh-plugin-file-explorer` | `dsh-vscode` |
| Client `PKG` / `PACKAGE` (typert wire + registrant) | same | `dsh-vscode` |
| Settings namespace (`configForms.get`) | `supanexus-file-explorer` | `dsh-vscode` |
| CSS tag ids | `@supanexus/…/x.module.css` | `dsh-vscode/x.module.css` |
| Sidebar tab kind | `dsh-file-explorer` | `dsh-vscode` |
| Log tags | `[file-explorer]` | `[dsh-vscode]` |
| **Typert manifest** (`lib/types/typert.host.js` `PKG`) | `@supanexus/…` | `dsh-vscode` |
| **Invariant companion** (`lib/invariant.js` `PACKAGE_NAME`/`name`) | `@supanexus/…` / `supanexus-file-explorer-invariant` | `dsh-vscode` / `dsh-vscode-invariant` |
| Profile wiring | `data/profiles/{desktop,web}/package.json` dep + `bundles`, `node_modules` link, both lockfiles, `web/pnpm-workspace.yaml` `allowBuilds` | same, new name |

Deliberately **not** renamed: the view id `file-explorer` (it is baked into every
`data-file-explorer-*` attribute and its CSS), the locale namespace
`file-explorer`, the RPC service name `explorerFs`, and the upstream URLs in
`package.json` (this repo is a fork and attribution stays).

### The trap: a manifest can outlive a rename — and fail *silently*

A name change is easy to grep for, so `lib/index.js` / `lib/client.js` are the
obvious places and they were fixed first. What broke was a file that is never
imported by a plain `import './lib/index.js'`, and that a
`loadProfileDirectory()` / `--dump-config` probe also never touches:

```
typert-loader: dsh-vscode TYPERT manifest names package
"@supanexus/dsh-plugin-file-explorer" — the manifest must be owned by the
package that exports it
```

`lib/types/typert.host.js` declares the RPC type manifest and `dsh-typert-loader`
refuses any manifest that is not owned by the package exporting it. One stale
string → the whole entry never activates → the host is missing that RPC route →
the desktop shell's boot RPC fails (`desktop welcome: Web RPC failed`) → the
window sits on **"Loading plugins…" forever**, with no error surfaced in the UI.

Two things made this expensive to find, worth remembering:

- **A/B first, then dig.** The decisive step was removing `dsh-vscode` from
  `bundles` and rebooting: with it the shell hung at 0 stylesheet tags, without
  it 163 tags and a full UI. That proved the plugin was the cause before any
  forensics.
- **The desktop profile cannot be booted from the CLI** (`error: profile
  "desktop" is managed exclusively by the Electron application`), so the host
  error never reached an inspectable stream. The same bundle lives in the `web`
  profile, and `dsh --profile web --no-open` prints the typert error verbatim in
  one line. That is now the regression check.

Guard added: `D:/开发/_diag/_verify-plugin-boot.mjs` boots the web profile and
asserts `0` "did not activate" warnings, `0` ownership errors and no `supanexus`
in the output — a check that is *about activation*, not just about the composed
tree.

### Storage carry-over

`lib/client.js` gained a `legacy-storage.js` region that runs once at module
load: the seven localStorage keys move from the old namespace to the new one,
and any theme id embedded in the copied *value* is rewritten through a
longest-token-first map (`supanexus-file-explorer-vscode` → `dsh-vscode-imported`,
`supanexus-file-explorer-custom` → `dsh-vscode-custom`, then the bare prefix).
Without that last step a saved VSCode-theme choice would have degraded to
`vs-dark`, because the catch-all alone turns it into `dsh-vscode-vscode`, which
is not a registered theme id. A present new key always wins; a failing
`setItem` (quota) is swallowed so storage trouble can never break the plugin.

### Verification

- `_unit-rename-migration.mjs` — **25/25** (7 keys, value rewriting, new-key
  wins, quota failure, token ordering).
- `_verify-rename-host.mjs` — **13/13** (profile has `dsh-vscode` and no old
  name; resolves through the profile; six id surfaces all agree).
- `_verify-plugin-boot.mjs` — **6/6** (host actually activates).
- `_e2e-rename.mjs` — **8/8** in the live desktop app: the 5 stylesheet tags now
  carry `dsh-vscode/…`, 0 old ids, the Files view still mounts (`对话 | 文件`),
  Monaco loads, 0 page errors, 0 console errors.
- Pre-existing suites still green: 20/20, 38/38, 42/42, 19/19.
- The plugin appears in the app's plugin inventory as **`dsh-vscode`**.


## Addendum: VS Code-style IDE chrome and keyboard navigation (2026-10-13)

The client bundle now presents a 44 px activity bar with Explorer and Quick Open
actions. The Explorer stays available when its tree is collapsed. The file tree
supports Up/Down, Home/End, and parent/child movement with Left/Right; clicking
a row focuses it. `Ctrl+Shift+E` expands the tree and moves focus to a row.

The editor tab strip and tool strip use flatter VS Code-like spacing and square
tabs. A blue status bar spans the IDE and shows the active file's line/column,
encoding, language, and dirty state. Chrome styles now target the view root so
they also apply to the editor, which is a sibling of the Explorer panel.

Only `lib/client.js` was edited: this local fork contains the compiled client
bundle but no matching TypeScript source. Keep the original bundle in the
workspace staging backup before replacing it during future rebuilds.

Verified in the desktop app using the D-drive profile: the client loaded
without page errors; activity bar, file tree navigation, Ctrl+B,
Ctrl+Shift+E, tabs, and status bar passed live checks. The same client bundle
was copied to the source fork and desktop/web profile installations.

## Addendum: responsive Explorer and source recovery (2026-10-13)

When DSH's right sidebar leaves the IDE at 720 px or less, the Explorer tree
becomes a drawer over the editor instead of shrinking the editor to an
unusable strip. Opening a file from the drawer closes it. The file tree also
accepts `Delete` with the existing confirmation dialog; `F2` already renamed.

The local fork had no TS/TSX source even though its package advertised a TS
build. `src/` now contains the current host and client as editable JavaScript
fragments. `scripts/build.mjs` concatenates them in `src/parts.json` order to
reproduce both `lib/` entry points, and `npm test` verifies the outputs and
syntax. Plugin code, embedded styles, and frozen vendor snapshots are kept in
separate directories. This is recovered source for the current local fork,
not the missing original TypeScript source.

Verified after installing the rebuilt client: `npm test` passed; the desktop
plugin activated without page errors; all prior IDE interaction checks passed.
At a 500 px IDE width the tree was an absolute drawer, the editor retained
456 px, and opening a file closed the drawer. Pressing `Delete` requested
confirmation; declining it left the file intact. Source and all three installed
client bundles have the same hash.
