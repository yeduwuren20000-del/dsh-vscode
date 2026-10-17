		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
		var errorUtil;
		(function(errorUtil) {
			errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
			errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
		})(errorUtil || (errorUtil = {}));
		//#endregion
