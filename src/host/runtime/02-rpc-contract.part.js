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
