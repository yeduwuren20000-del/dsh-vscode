//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `dsh-vscode`.
* @module dsh-vscode/invariant
*/
const PACKAGE_NAME = "dsh-vscode";
/** Cordis companion plugin name. */
const name = "dsh-vscode-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/** No mutable package-owned runtime state beyond Cordis effects. */
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
