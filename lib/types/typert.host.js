/**
 * Hand-written Host Typert face for packages outside the engine generator graph.
 * Loaded via package.json exports["./typert"].
 *
 * Must be self-contained: the loader imports this file alone from the packed
 * package (package.json `files` may omit other lib/types/*.js modules).
 */
import { z } from 'zod';
const EXPLORER_FS_SERVICE = 'explorerFs';
const FailCode = z.enum([
    'OUT_OF_ROOT',
    'NOT_FOUND',
    'NOT_EMPTY',
    'EXISTS',
    'IS_BINARY',
    'IS_DIR',
    'IO',
    'TOO_LARGE',
    'CONFLICT',
]);
const FailResult = z.object({
    ok: z.literal(false),
    code: FailCode,
    message: z.string(),
});
const OkResult = z.object({ ok: z.literal(true) });
const RootOk = z.object({ ok: z.literal(true), root: z.string() });
// No `size` here: the client never rendered it, and computing it forced a
// per-child `stat` on every directory listing.
const FsEntry = z.object({
    name: z.string(),
    path: z.string(),
    kind: z.enum(['file', 'dir']),
});
const ListOk = z.object({ ok: z.literal(true), entries: z.array(FsEntry) });
// `mtimeMs` travels with the content so a later save can prove it is still
// writing over the revision it read (see the CONFLICT fail code).
const ReadOk = z.object({ ok: z.literal(true), content: z.string(), mtimeMs: z.number() });
const WriteOk = z.object({ ok: z.literal(true), mtimeMs: z.number() });
const ChangesOk = z.object({
    ok: z.literal(true),
    revision: z.number(),
    paths: z.array(z.string()),
});
const RootResult = z.union([RootOk, FailResult]);
const ListResult = z.union([ListOk, FailResult]);
const ReadResult = z.union([ReadOk, FailResult]);
const WriteResult = z.union([WriteOk, FailResult]);
const ChangesResult = z.union([ChangesOk, FailResult]);
const MutateResult = z.union([OkResult, FailResult]);
// Probe result for the VSCode profile import. The profile itself travels as a
// JSON string: it carries a theme palette with 200+ colour keys and hundreds of
// token rules, which is not worth modelling as a strict codec schema.
const VscodeProfileOk = z.object({
    ok: z.literal(true),
    found: z.boolean(),
    source: z.string(),
    profile: z.string(),
});
const VscodeProfileResult = z.union([VscodeProfileOk, FailResult]);
const PKG = 'dsh-vscode';
const Str = z.string();
const Num = z.number();
function strParam(name) {
    return {
        name,
        wire: name,
        source: 'json',
        codec: {
            mode: 'strict',
            typeSymbol: `${PKG}/types#String`,
            create: () => Str,
        },
    };
}
function numParam(name) {
    return {
        name,
        wire: name,
        source: 'json',
        codec: {
            mode: 'strict',
            typeSymbol: `${PKG}/types#Number`,
            create: () => Num,
        },
    };
}
function resultCodec(schema, typeSymbol) {
    return {
        mode: 'strict',
        typeSymbol: `${PKG}/types#${typeSymbol}`,
        create: () => schema,
    };
}
function invocation(method, parameters, result) {
    return {
        id: `${PKG}#${EXPLORER_FS_SERVICE}/${method}`,
        service: EXPLORER_FS_SERVICE,
        namespace: EXPLORER_FS_SERVICE,
        method,
        invocation: { kind: 'direct' },
        parameters,
        result,
        sourceLocation: { file: 'src/host/fs-service.ts', line: 1, column: 1 },
    };
}
/** Host Typert contribution consumed by typert-loader. */
export const TYPERT = {
    package: PKG,
    face: 'host',
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations: [
        invocation('getRoot', [], resultCodec(RootOk, 'RootOk')),
        invocation('setRoot', [strParam('root')], resultCodec(RootResult, 'RootResult')),
        invocation('list', [strParam('path')], resultCodec(ListResult, 'ListResult')),
        invocation('read', [strParam('path')], resultCodec(ReadResult, 'ReadResult')),
        invocation('write', [strParam('path'), strParam('content'), numParam('expectedMtimeMs')], resultCodec(WriteResult, 'WriteResult')),
        invocation('changes', [numParam('since')], resultCodec(ChangesResult, 'ChangesResult')),
        invocation('mkdir', [strParam('path')], resultCodec(MutateResult, 'MutateResult')),
        invocation('rename', [strParam('from'), strParam('to')], resultCodec(MutateResult, 'MutateResult')),
        invocation('unlink', [strParam('path')], resultCodec(MutateResult, 'MutateResult')),
        invocation('revealRoot', [], resultCodec(MutateResult, 'MutateResult')),
        invocation('revealPath', [strParam('path')], resultCodec(MutateResult, 'MutateResult')),
        invocation('vscodeProfile', [], resultCodec(VscodeProfileResult, 'VscodeProfileResult')),
    ],
};
export default TYPERT;
//# sourceMappingURL=typert.host.js.map