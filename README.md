# dsh-vscode

VSCode-like workspace editor for DeepSeek Harness: a file tree plus a multi-tab
Monaco editor inside the conversation view, a per-session folder, a panel that
talks to a subagent, and VSCode's keybindings.

中文说明见 [README.zh.md](README.zh.md).

Fork of [`@supanexus/dsh-plugin-file-explorer`](https://github.com/supanexus/dsh-plugin-file-explorer)
(v0.1.0), retargeted at, and substantially extended for, DSH `0.2.0-rc.2`. See
`PATCH-NOTES.md` for the full change log.

## Install

Install straight from GitHub:

```bash
dsh plugin --profile desktop add "github:yeduwuren20000-del/dsh-vscode"
```

Or clone and link a local checkout:

```bash
git clone https://github.com/yeduwuren20000-del/dsh-vscode.git
dsh plugin --profile desktop add "link:<path-to>/dsh-vscode"
```

Or by hand, in the profile's `package.json`:

```json
{ "dependencies": { "dsh-vscode": "link:<path-to>/dsh-vscode" } }
```

and add `"dsh-vscode"` to `dsh.profile.bundles`. Restart the host afterwards —
the plugin list is read at boot.

## Features

- **Files** view with a center tree | editor split; the left sidebar stays the
  official workspace / conversation list
- One folder per session, holding that session's own files (extracted from the
  session log), with a `相关文件.md` index and a hardlink mirror
- Multi-tab editing, dirty marks, Ctrl/Cmd+S, Markdown source / preview toggle
- Create / rename / delete (non-empty directories are rejected)
- Monaco (CDN) with a Minimap toggle and an imported VSCode theme + colour scheme
- VSCode keys: `Ctrl+P` quick open, `Ctrl+B` tree, `Ctrl+Shift+E` focus tree,
  `Ctrl+W` close tab, `Ctrl+Tab` / `Ctrl+PageUp/Down` cycle, `Ctrl+1..9`;
  Arrow keys, `F2`, and `Delete` also work in the tree
- In narrow layouts the Explorer becomes a drawer and closes after a file opens
- A subagent seat under the editor that follows the current session's model

## Config

`cordis.patch.yml`:

```yaml
- insert:
    - id: dsh-vscode
      name: 'dsh-vscode'
      config:
        root: 'D:/work'          # change this to your own directory
        openLinksInEditor: false
```

Settings → Plugins → **dsh-vscode** hot-updates these fields.

> `root` is the tree the Explorer opens on. The bundled default in
> `cordis.patch.yml` points at the author's machine, so set it to your own
> directory after installing. A relative or empty value is not recommended —
> under the desktop host it resolves to the app install directory.

## Develop / rebuild

Editable JavaScript source is in `src/`, with its build order in
`src/parts.json`. The original TS/TSX was not preserved in this fork;
the current source was recovered from the working bundle and split into plugin
logic, styles, and vendor snapshots. Build and verify without an engine checkout:

```bash
npm run build
npm test
```

The host loads `lib/`; building regenerates both entry points. See
`src/README.md` for the source layout.

## License

MIT. Original work © SupaNexus; modifications © yeduwuren. See `LICENSE`.
