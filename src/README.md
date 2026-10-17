# Source layout

The original TypeScript source was absent from this local fork. This directory
recovers the **currently running** host and client as readable JavaScript
fragments. It is the source of truth for `lib/index.js` and `lib/client.js`.

- `host/runtime/` contains the host implementation.
- `client/runtime/` contains the Explorer, editor, state, and integration code.
- `client/styles/` contains the embedded CSS and module style registrations.
- `client/vendor/` contains frozen bundled copies of Zod and Marked. Avoid
  editing these when changing plugin behavior.
- `parts.json` records the exact concatenation order. Fragments share a module
  scope and are not standalone ES modules.

Run `npm run build` (or `node scripts/build.mjs`) to regenerate the two `lib/`
entry points. Run `npm test` to check that the outputs match the source and
parse as JavaScript. No engine checkout or network install is needed for this
build. After building, copy `lib/client.js` to both installed profiles if they
are separate physical copies; the desktop host reads the D-drive profile.

This is reconstructed JavaScript source, not the missing original TS/TSX. It
preserves all local behavior that had been added after the upstream fork.
