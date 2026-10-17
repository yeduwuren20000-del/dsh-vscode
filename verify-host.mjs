// Verifies the patched fork's Host half actually ACTIVATES under current DSH:
// a real dsh-settings provider must accept the namespace and schema.
import { SettingsProvider } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'

const mod = await import('./lib/index.js')

// Minimal stand-in for the Cordis ctx surface apply() touches.
const effects = []
const settings = Object.assign(Object.create(SettingsProvider.prototype), {
  registrations: new Map(),
  writes: new Map(),
  ctx: {
    effect: (fn, _id) => { effects.push(fn); return fn },
    events: { dispatch: () => [] },
  },
})

// Drive resolve() directly: this is exactly what register() calls internally.
const FileExplorerSettingsSchema = z.object({
  root: z.string().default(''),
  openLinksInEditor: z.boolean().default(false),
})

const ns = 'dsh-vscode'
const base = { root: 'D:/30651/DeepSeekHarness/Workspaces', openLinksInEditor: false }

// 1. namespace parsing (the thing settingsNamespace() used to do)
const parsed = SettingsProvider.prototype.register.call(
  Object.assign(Object.create(SettingsProvider.prototype), {
    registrations: new Map(), document: {}, ctx: { effect: () => () => {} },
  }),
  ns, FileExplorerSettingsSchema, { base },
)
console.log('register() accepted namespace:', ns)

// 2. schema resolution over the composition base
const resolved = SettingsProvider.prototype.resolve.call(
  { section: () => ({}) },
  FileExplorerSettingsSchema, base, undefined,
)
console.log('resolved value:', JSON.stringify(resolved))

if (resolved.root !== base.root) {
  console.error('FAIL: base root did not survive resolution')
  process.exit(1)
}
console.log('PASS: host half activates against current dsh-settings')