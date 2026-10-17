window.__ModuleLoader__.load({
	id: "dsh-vscode",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region lib/types/shared/settings-contract.js
		/** Settings namespace contract visible to both Host and Client. */
		/** Must match Host settingsNamespace pattern /^[a-z][a-z0-9-]*$/ and the
		* Host cordis plugin id (`dsh-vscode`), because a plugin's settings
		* namespace IS its cordis entry config in DSH 0.2.0-rc.2. */
		const FILE_EXPLORER_SETTINGS_NS = "dsh-vscode";
		//#endregion
		//#region lib/types/client/legacy-storage.js
		/**
		* PATCH(2026-10-13): the plugin was renamed `@supanexus/dsh-plugin-file-explorer`
		* -> `dsh-vscode`.
		*
		* Carry the previous localStorage keys over exactly once, so an existing
		* install keeps its editor appearance, saved schemes, theme choice, tree
		* width and subagent-panel state instead of silently resetting to defaults.
		* Values that embed the old namespace (Monaco theme ids registered under
		* the old prefix) are rewritten inline so a saved theme selection still
		* resolves against the newly registered ids.
		*/
		const LEGACY_NAMESPACE = "supanexus-file-explorer";
		/**
		* Longest token first: the two Monaco theme ids registered under the old
		* prefix are NOT the prefix plus a suffix, so they need their own mapping
		* before the catch-all runs (`supanexus-file-explorer-vscode` would
		* otherwise degrade to `dsh-vscode-vscode` and stop resolving).
		*/
		const LEGACY_VALUE_TOKENS = [
			[`${LEGACY_NAMESPACE}-vscode`, "dsh-vscode-imported"],
			[`${LEGACY_NAMESPACE}-custom`, "dsh-vscode-custom"],
			[LEGACY_NAMESPACE, "dsh-vscode"]
		];
		const LEGACY_KEY_PAIRS = [
			[`${LEGACY_NAMESPACE}:editor-appearance`, "dsh-vscode:editor-appearance"],
			[`${LEGACY_NAMESPACE}:editor-appearance-schemes`, "dsh-vscode:editor-appearance-schemes"],
			[`${LEGACY_NAMESPACE}:theme-chosen`, "dsh-vscode:theme-chosen"],
			[`${LEGACY_NAMESPACE}:tree-width`, "dsh-vscode:tree-width"],
			[`${LEGACY_NAMESPACE}:tree-hidden`, "dsh-vscode:tree-hidden"],
			["dsh-file-explorer.subagentHeight", "dsh-vscode.subagentHeight"],
			["dsh-file-explorer.subagentActive", "dsh-vscode.subagentActive"]
		];
		/** Rewrite the theme ids a stored value may embed. */
		function rewriteLegacyValue(raw) {
			let next = raw;
			for (const [from, to] of LEGACY_VALUE_TOKENS) next = next.split(from).join(to);
			return next;
		}
		/** Copy each legacy key forward once; a present new key always wins. */
		function migrateLegacyStorage() {
			try {
				if (typeof localStorage === "undefined") return;
				for (const [legacyKey, key] of LEGACY_KEY_PAIRS) {
					if (localStorage.getItem(key) !== null) continue;
					const legacy = localStorage.getItem(legacyKey);
					if (legacy === null) continue;
					localStorage.setItem(key, rewriteLegacyValue(legacy));
				}
			} catch (error) {
				console.warn("[dsh-vscode] legacy storage migration skipped:", error);
			}
		}
		migrateLegacyStorage();
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/util.js
		var util;
		(function(util) {
			util.assertEqual = (_) => {};
			function assertIs(_arg) {}
			util.assertIs = assertIs;
			function assertNever(_x) {
				throw new Error();
			}
			util.assertNever = assertNever;
			util.arrayToEnum = (items) => {
				const obj = {};
				for (const item of items) obj[item] = item;
				return obj;
			};
			util.getValidEnumValues = (obj) => {
				const validKeys = util.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
				const filtered = {};
				for (const k of validKeys) filtered[k] = obj[k];
				return util.objectValues(filtered);
			};
			util.objectValues = (obj) => {
				return util.objectKeys(obj).map(function(e) {
					return obj[e];
				});
			};
			util.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
				const keys = [];
				for (const key in object) if (Object.prototype.hasOwnProperty.call(object, key)) keys.push(key);
				return keys;
			};
			util.find = (arr, checker) => {
				for (const item of arr) if (checker(item)) return item;
			};
			util.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
			function joinValues(array, separator = " | ") {
				return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
			}
			util.joinValues = joinValues;
			util.jsonStringifyReplacer = (_, value) => {
				if (typeof value === "bigint") return value.toString();
				return value;
			};
		})(util || (util = {}));
		var objectUtil;
		(function(objectUtil) {
			objectUtil.mergeShapes = (first, second) => {
				return {
					...first,
					...second
				};
			};
		})(objectUtil || (objectUtil = {}));
		const ZodParsedType = util.arrayToEnum([
			"string",
			"nan",
			"number",
			"integer",
			"float",
			"boolean",
			"date",
			"bigint",
			"symbol",
			"function",
			"undefined",
			"null",
			"array",
			"object",
			"unknown",
			"promise",
			"void",
			"never",
			"map",
			"set"
		]);
		const getParsedType = (data) => {
			switch (typeof data) {
				case "undefined": return ZodParsedType.undefined;
				case "string": return ZodParsedType.string;
				case "number": return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
				case "boolean": return ZodParsedType.boolean;
				case "function": return ZodParsedType.function;
				case "bigint": return ZodParsedType.bigint;
				case "symbol": return ZodParsedType.symbol;
				case "object":
					if (Array.isArray(data)) return ZodParsedType.array;
					if (data === null) return ZodParsedType.null;
					if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") return ZodParsedType.promise;
					if (typeof Map !== "undefined" && data instanceof Map) return ZodParsedType.map;
					if (typeof Set !== "undefined" && data instanceof Set) return ZodParsedType.set;
					if (typeof Date !== "undefined" && data instanceof Date) return ZodParsedType.date;
					return ZodParsedType.object;
				default: return ZodParsedType.unknown;
			}
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/ZodError.js
		const ZodIssueCode = util.arrayToEnum([
			"invalid_type",
			"invalid_literal",
			"custom",
			"invalid_union",
			"invalid_union_discriminator",
			"invalid_enum_value",
			"unrecognized_keys",
			"invalid_arguments",
			"invalid_return_type",
			"invalid_date",
			"invalid_string",
			"too_small",
			"too_big",
			"invalid_intersection_types",
			"not_multiple_of",
			"not_finite"
		]);
		var ZodError = class ZodError extends Error {
			get errors() {
				return this.issues;
			}
			constructor(issues) {
				super();
				this.issues = [];
				this.addIssue = (sub) => {
					this.issues = [...this.issues, sub];
				};
				this.addIssues = (subs = []) => {
					this.issues = [...this.issues, ...subs];
				};
				const actualProto = new.target.prototype;
				if (Object.setPrototypeOf) Object.setPrototypeOf(this, actualProto);
				else this.__proto__ = actualProto;
				this.name = "ZodError";
				this.issues = issues;
			}
			format(_mapper) {
				const mapper = _mapper || function(issue) {
					return issue.message;
				};
				const fieldErrors = { _errors: [] };
				const processError = (error) => {
					for (const issue of error.issues) if (issue.code === "invalid_union") issue.unionErrors.map(processError);
					else if (issue.code === "invalid_return_type") processError(issue.returnTypeError);
					else if (issue.code === "invalid_arguments") processError(issue.argumentsError);
					else if (issue.path.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < issue.path.length) {
							const el = issue.path[i];
							if (!(i === issue.path.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				};
				processError(this);
				return fieldErrors;
			}
			static assert(value) {
				if (!(value instanceof ZodError)) throw new Error(`Not a ZodError: ${value}`);
			}
			toString() {
				return this.message;
			}
			get message() {
				return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
			}
			get isEmpty() {
				return this.issues.length === 0;
			}
			flatten(mapper = (issue) => issue.message) {
				const fieldErrors = {};
				const formErrors = [];
				for (const sub of this.issues) if (sub.path.length > 0) {
					const firstEl = sub.path[0];
					fieldErrors[firstEl] = fieldErrors[firstEl] || [];
					fieldErrors[firstEl].push(mapper(sub));
				} else formErrors.push(mapper(sub));
				return {
					formErrors,
					fieldErrors
				};
			}
			get formErrors() {
				return this.flatten();
			}
		};
		ZodError.create = (issues) => {
			return new ZodError(issues);
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/locales/en.js
		const errorMap = (issue, _ctx) => {
			let message;
			switch (issue.code) {
				case ZodIssueCode.invalid_type:
					if (issue.received === ZodParsedType.undefined) message = "Required";
					else message = `Expected ${issue.expected}, received ${issue.received}`;
					break;
				case ZodIssueCode.invalid_literal:
					message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
					break;
				case ZodIssueCode.unrecognized_keys:
					message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
					break;
				case ZodIssueCode.invalid_union:
					message = `Invalid input`;
					break;
				case ZodIssueCode.invalid_union_discriminator:
					message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
					break;
				case ZodIssueCode.invalid_enum_value:
					message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
					break;
				case ZodIssueCode.invalid_arguments:
					message = `Invalid function arguments`;
					break;
				case ZodIssueCode.invalid_return_type:
					message = `Invalid function return type`;
					break;
				case ZodIssueCode.invalid_date:
					message = `Invalid date`;
					break;
				case ZodIssueCode.invalid_string:
					if (typeof issue.validation === "object") {
						if ("includes" in issue.validation) {
							message = `Invalid input: must include "${issue.validation.includes}"`;
							if (typeof issue.validation.position === "number") message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
						} else if ("startsWith" in issue.validation) message = `Invalid input: must start with "${issue.validation.startsWith}"`;
						else if ("endsWith" in issue.validation) message = `Invalid input: must end with "${issue.validation.endsWith}"`;
						else util.assertNever(issue.validation);
					} else if (issue.validation !== "regex") message = `Invalid ${issue.validation}`;
					else message = "Invalid";
					break;
				case ZodIssueCode.too_small:
					if (issue.type === "array") message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
					else if (issue.type === "string") message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
					else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
					else if (issue.type === "bigint") message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
					else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
					else message = "Invalid input";
					break;
				case ZodIssueCode.too_big:
					if (issue.type === "array") message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
					else if (issue.type === "string") message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
					else if (issue.type === "number") message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
					else if (issue.type === "bigint") message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
					else if (issue.type === "date") message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
					else message = "Invalid input";
					break;
				case ZodIssueCode.custom:
					message = `Invalid input`;
					break;
				case ZodIssueCode.invalid_intersection_types:
					message = `Intersection results could not be merged`;
					break;
				case ZodIssueCode.not_multiple_of:
					message = `Number must be a multiple of ${issue.multipleOf}`;
					break;
				case ZodIssueCode.not_finite:
					message = "Number must be finite";
					break;
				default:
					message = _ctx.defaultError;
					util.assertNever(issue);
			}
			return { message };
		};
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/errors.js
		let overrideErrorMap = errorMap;
		function getErrorMap() {
			return overrideErrorMap;
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/parseUtil.js
		const makeIssue = (params) => {
			const { data, path, errorMaps, issueData } = params;
			const fullPath = [...path, ...issueData.path || []];
			const fullIssue = {
				...issueData,
				path: fullPath
			};
			if (issueData.message !== void 0) return {
				...issueData,
				path: fullPath,
				message: issueData.message
			};
			let errorMessage = "";
			const maps = errorMaps.filter((m) => !!m).slice().reverse();
			for (const map of maps) errorMessage = map(fullIssue, {
				data,
				defaultError: errorMessage
			}).message;
			return {
				...issueData,
				path: fullPath,
				message: errorMessage
			};
		};
		function addIssueToContext(ctx, issueData) {
			const overrideMap = getErrorMap();
			const issue = makeIssue({
				issueData,
				data: ctx.data,
				path: ctx.path,
				errorMaps: [
					ctx.common.contextualErrorMap,
					ctx.schemaErrorMap,
					overrideMap,
					overrideMap === errorMap ? void 0 : errorMap
				].filter((x) => !!x)
			});
			ctx.common.issues.push(issue);
		}
		var ParseStatus = class ParseStatus {
			constructor() {
				this.value = "valid";
			}
			dirty() {
				if (this.value === "valid") this.value = "dirty";
			}
			abort() {
				if (this.value !== "aborted") this.value = "aborted";
			}
			static mergeArray(status, results) {
				const arrayValue = [];
				for (const s of results) {
					if (s.status === "aborted") return INVALID;
					if (s.status === "dirty") status.dirty();
					arrayValue.push(s.value);
				}
				return {
					status: status.value,
					value: arrayValue
				};
			}
			static async mergeObjectAsync(status, pairs) {
				const syncPairs = [];
				for (const pair of pairs) {
					const key = await pair.key;
					const value = await pair.value;
					syncPairs.push({
						key,
						value
					});
				}
				return ParseStatus.mergeObjectSync(status, syncPairs);
			}
			static mergeObjectSync(status, pairs) {
				const finalObject = {};
				for (const pair of pairs) {
					const { key, value } = pair;
					if (key.status === "aborted") return INVALID;
					if (value.status === "aborted") return INVALID;
					if (key.status === "dirty") status.dirty();
					if (value.status === "dirty") status.dirty();
					if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) finalObject[key.value] = value.value;
				}
				return {
					status: status.value,
					value: finalObject
				};
			}
		};
		const INVALID = Object.freeze({ status: "aborted" });
		const DIRTY = (value) => ({
			status: "dirty",
			value
		});
		const OK = (value) => ({
			status: "valid",
			value
		});
		const isAborted = (x) => x.status === "aborted";
		const isDirty = (x) => x.status === "dirty";
		const isValid = (x) => x.status === "valid";
		const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/helpers/errorUtil.js
		var errorUtil;
		(function(errorUtil) {
			errorUtil.errToObj = (message) => typeof message === "string" ? { message } : message || {};
			errorUtil.toString = (message) => typeof message === "string" ? message : message?.message;
		})(errorUtil || (errorUtil = {}));
		//#endregion
		//#region ../../../node_modules/.pnpm/zod@3.25.76/node_modules/zod/v3/types.js
		var ParseInputLazyPath = class {
			constructor(parent, value, path, key) {
				this._cachedPath = [];
				this.parent = parent;
				this.data = value;
				this._path = path;
				this._key = key;
			}
			get path() {
				if (!this._cachedPath.length) {
					if (Array.isArray(this._key)) this._cachedPath.push(...this._path, ...this._key);
					else this._cachedPath.push(...this._path, this._key);
				}
				return this._cachedPath;
			}
		};
		const handleResult = (ctx, result) => {
			if (isValid(result)) return {
				success: true,
				data: result.value
			};
			else {
				if (!ctx.common.issues.length) throw new Error("Validation failed but no issues detected.");
				return {
					success: false,
					get error() {
						if (this._error) return this._error;
						const error = new ZodError(ctx.common.issues);
						this._error = error;
						return this._error;
					}
				};
			}
		};
		function processCreateParams(params) {
			if (!params) return {};
			const { errorMap, invalid_type_error, required_error, description } = params;
			if (errorMap && (invalid_type_error || required_error)) throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
			if (errorMap) return {
				errorMap,
				description
			};
			const customMap = (iss, ctx) => {
				const { message } = params;
				if (iss.code === "invalid_enum_value") return { message: message ?? ctx.defaultError };
				if (typeof ctx.data === "undefined") return { message: message ?? required_error ?? ctx.defaultError };
				if (iss.code !== "invalid_type") return { message: ctx.defaultError };
				return { message: message ?? invalid_type_error ?? ctx.defaultError };
			};
			return {
				errorMap: customMap,
				description
			};
		}
		var ZodType = class {
			get description() {
				return this._def.description;
			}
			_getType(input) {
				return getParsedType(input.data);
			}
			_getOrReturnCtx(input, ctx) {
				return ctx || {
					common: input.parent.common,
					data: input.data,
					parsedType: getParsedType(input.data),
					schemaErrorMap: this._def.errorMap,
					path: input.path,
					parent: input.parent
				};
			}
			_processInputParams(input) {
				return {
					status: new ParseStatus(),
					ctx: {
						common: input.parent.common,
						data: input.data,
						parsedType: getParsedType(input.data),
						schemaErrorMap: this._def.errorMap,
						path: input.path,
						parent: input.parent
					}
				};
			}
			_parseSync(input) {
				const result = this._parse(input);
				if (isAsync(result)) throw new Error("Synchronous parse encountered promise.");
				return result;
			}
			_parseAsync(input) {
				const result = this._parse(input);
				return Promise.resolve(result);
			}
			parse(data, params) {
				const result = this.safeParse(data, params);
				if (result.success) return result.data;
				throw result.error;
			}
			safeParse(data, params) {
				const ctx = {
					common: {
						issues: [],
						async: params?.async ?? false,
						contextualErrorMap: params?.errorMap
					},
					path: params?.path || [],
					schemaErrorMap: this._def.errorMap,
					parent: null,
					data,
					parsedType: getParsedType(data)
				};
				const result = this._parseSync({
					data,
					path: ctx.path,
					parent: ctx
				});
				return handleResult(ctx, result);
			}
			"~validate"(data) {
				const ctx = {
					common: {
						issues: [],
						async: !!this["~standard"].async
					},
					path: [],
					schemaErrorMap: this._def.errorMap,
					parent: null,
					data,
					parsedType: getParsedType(data)
				};
				if (!this["~standard"].async) try {
					const result = this._parseSync({
						data,
						path: [],
						parent: ctx
					});
					return isValid(result) ? { value: result.value } : { issues: ctx.common.issues };
				} catch (err) {
					if (err?.message?.toLowerCase()?.includes("encountered")) this["~standard"].async = true;
					ctx.common = {
						issues: [],
						async: true
					};
				}
				return this._parseAsync({
					data,
					path: [],
					parent: ctx
				}).then((result) => isValid(result) ? { value: result.value } : { issues: ctx.common.issues });
			}
			async parseAsync(data, params) {
				const result = await this.safeParseAsync(data, params);
				if (result.success) return result.data;
				throw result.error;
			}
			async safeParseAsync(data, params) {
				const ctx = {
					common: {
						issues: [],
						contextualErrorMap: params?.errorMap,
						async: true
					},
					path: params?.path || [],
					schemaErrorMap: this._def.errorMap,
					parent: null,
					data,
					parsedType: getParsedType(data)
				};
				const maybeAsyncResult = this._parse({
					data,
					path: ctx.path,
					parent: ctx
				});
				const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
				return handleResult(ctx, result);
			}
			refine(check, message) {
				const getIssueProperties = (val) => {
					if (typeof message === "string" || typeof message === "undefined") return { message };
					else if (typeof message === "function") return message(val);
					else return message;
				};
				return this._refinement((val, ctx) => {
					const result = check(val);
					const setError = () => ctx.addIssue({
						code: ZodIssueCode.custom,
						...getIssueProperties(val)
					});
					if (typeof Promise !== "undefined" && result instanceof Promise) return result.then((data) => {
						if (!data) {
							setError();
							return false;
						} else return true;
					});
					if (!result) {
						setError();
						return false;
					} else return true;
				});
			}
			refinement(check, refinementData) {
				return this._refinement((val, ctx) => {
					if (!check(val)) {
						ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
						return false;
					} else return true;
				});
			}
			_refinement(refinement) {
				return new ZodEffects({
					schema: this,
					typeName: ZodFirstPartyTypeKind.ZodEffects,
					effect: {
						type: "refinement",
						refinement
					}
				});
			}
			superRefine(refinement) {
				return this._refinement(refinement);
			}
			constructor(def) {
				/** Alias of safeParseAsync */
				this.spa = this.safeParseAsync;
				this._def = def;
				this.parse = this.parse.bind(this);
				this.safeParse = this.safeParse.bind(this);
				this.parseAsync = this.parseAsync.bind(this);
				this.safeParseAsync = this.safeParseAsync.bind(this);
				this.spa = this.spa.bind(this);
				this.refine = this.refine.bind(this);
				this.refinement = this.refinement.bind(this);
				this.superRefine = this.superRefine.bind(this);
				this.optional = this.optional.bind(this);
				this.nullable = this.nullable.bind(this);
				this.nullish = this.nullish.bind(this);
				this.array = this.array.bind(this);
				this.promise = this.promise.bind(this);
				this.or = this.or.bind(this);
				this.and = this.and.bind(this);
				this.transform = this.transform.bind(this);
				this.brand = this.brand.bind(this);
				this.default = this.default.bind(this);
				this.catch = this.catch.bind(this);
				this.describe = this.describe.bind(this);
				this.pipe = this.pipe.bind(this);
				this.readonly = this.readonly.bind(this);
				this.isNullable = this.isNullable.bind(this);
				this.isOptional = this.isOptional.bind(this);
				this["~standard"] = {
					version: 1,
					vendor: "zod",
					validate: (data) => this["~validate"](data)
				};
			}
			optional() {
				return ZodOptional.create(this, this._def);
			}
			nullable() {
				return ZodNullable.create(this, this._def);
			}
			nullish() {
				return this.nullable().optional();
			}
			array() {
				return ZodArray.create(this);
			}
			promise() {
				return ZodPromise.create(this, this._def);
			}
			or(option) {
				return ZodUnion.create([this, option], this._def);
			}
			and(incoming) {
				return ZodIntersection.create(this, incoming, this._def);
			}
			transform(transform) {
				return new ZodEffects({
					...processCreateParams(this._def),
					schema: this,
					typeName: ZodFirstPartyTypeKind.ZodEffects,
					effect: {
						type: "transform",
						transform
					}
				});
			}
			default(def) {
				const defaultValueFunc = typeof def === "function" ? def : () => def;
				return new ZodDefault({
					...processCreateParams(this._def),
					innerType: this,
					defaultValue: defaultValueFunc,
					typeName: ZodFirstPartyTypeKind.ZodDefault
				});
			}
			brand() {
				return new ZodBranded({
					typeName: ZodFirstPartyTypeKind.ZodBranded,
					type: this,
					...processCreateParams(this._def)
				});
			}
			catch(def) {
				const catchValueFunc = typeof def === "function" ? def : () => def;
				return new ZodCatch({
					...processCreateParams(this._def),
					innerType: this,
					catchValue: catchValueFunc,
					typeName: ZodFirstPartyTypeKind.ZodCatch
				});
			}
			describe(description) {
				const This = this.constructor;
				return new This({
					...this._def,
					description
				});
			}
			pipe(target) {
				return ZodPipeline.create(this, target);
			}
			readonly() {
				return ZodReadonly.create(this);
			}
			isOptional() {
				return this.safeParse(void 0).success;
			}
			isNullable() {
				return this.safeParse(null).success;
			}
		};
		const cuidRegex = /^c[^\s-]{8,}$/i;
		const cuid2Regex = /^[0-9a-z]+$/;
		const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
		const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
		const nanoidRegex = /^[a-z0-9_-]{21}$/i;
		const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
		const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
		const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
		const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		let emojiRegex;
		const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
		const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
		const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
		const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
		const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
		const dateRegex = new RegExp(`^${dateRegexSource}$`);
		function timeRegexSource(args) {
			let secondsRegexSource = `[0-5]\\d`;
			if (args.precision) secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
			else if (args.precision == null) secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
			const secondsQuantifier = args.precision ? "+" : "?";
			return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
		}
		function timeRegex(args) {
			return new RegExp(`^${timeRegexSource(args)}$`);
		}
		function datetimeRegex(args) {
			let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
			const opts = [];
			opts.push(args.local ? `Z?` : `Z`);
			if (args.offset) opts.push(`([+-]\\d{2}:?\\d{2})`);
			regex = `${regex}(${opts.join("|")})`;
			return new RegExp(`^${regex}$`);
		}
		function isValidIP(ip, version) {
			if ((version === "v4" || !version) && ipv4Regex.test(ip)) return true;
			if ((version === "v6" || !version) && ipv6Regex.test(ip)) return true;
			return false;
		}
		function isValidJWT(jwt, alg) {
			if (!jwtRegex.test(jwt)) return false;
			try {
				const [header] = jwt.split(".");
				if (!header) return false;
				const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
				const decoded = JSON.parse(atob(base64));
				if (typeof decoded !== "object" || decoded === null) return false;
				if ("typ" in decoded && decoded?.typ !== "JWT") return false;
				if (!decoded.alg) return false;
				if (alg && decoded.alg !== alg) return false;
				return true;
			} catch {
				return false;
			}
		}
		function isValidCidr(ip, version) {
			if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) return true;
			if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) return true;
			return false;
		}
		var ZodString = class ZodString extends ZodType {
			_parse(input) {
				if (this._def.coerce) input.data = String(input.data);
				if (this._getType(input) !== ZodParsedType.string) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.string,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const status = new ParseStatus();
				let ctx = void 0;
				for (const check of this._def.checks) if (check.kind === "min") {
					if (input.data.length < check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							minimum: check.value,
							type: "string",
							inclusive: true,
							exact: false,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "max") {
					if (input.data.length > check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							maximum: check.value,
							type: "string",
							inclusive: true,
							exact: false,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "length") {
					const tooBig = input.data.length > check.value;
					const tooSmall = input.data.length < check.value;
					if (tooBig || tooSmall) {
						ctx = this._getOrReturnCtx(input, ctx);
						if (tooBig) addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							maximum: check.value,
							type: "string",
							inclusive: true,
							exact: true,
							message: check.message
						});
						else if (tooSmall) addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							minimum: check.value,
							type: "string",
							inclusive: true,
							exact: true,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "email") {
					if (!emailRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "email",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "emoji") {
					if (!emojiRegex) emojiRegex = new RegExp(_emojiRegex, "u");
					if (!emojiRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "emoji",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "uuid") {
					if (!uuidRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "uuid",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "nanoid") {
					if (!nanoidRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "nanoid",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "cuid") {
					if (!cuidRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "cuid",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "cuid2") {
					if (!cuid2Regex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "cuid2",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "ulid") {
					if (!ulidRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "ulid",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "url") try {
					new URL(input.data);
				} catch {
					ctx = this._getOrReturnCtx(input, ctx);
					addIssueToContext(ctx, {
						validation: "url",
						code: ZodIssueCode.invalid_string,
						message: check.message
					});
					status.dirty();
				}
				else if (check.kind === "regex") {
					check.regex.lastIndex = 0;
					if (!check.regex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "regex",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "trim") input.data = input.data.trim();
				else if (check.kind === "includes") {
					if (!input.data.includes(check.value, check.position)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: {
								includes: check.value,
								position: check.position
							},
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "toLowerCase") input.data = input.data.toLowerCase();
				else if (check.kind === "toUpperCase") input.data = input.data.toUpperCase();
				else if (check.kind === "startsWith") {
					if (!input.data.startsWith(check.value)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: { startsWith: check.value },
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "endsWith") {
					if (!input.data.endsWith(check.value)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: { endsWith: check.value },
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "datetime") {
					if (!datetimeRegex(check).test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: "datetime",
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "date") {
					if (!dateRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: "date",
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "time") {
					if (!timeRegex(check).test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_string,
							validation: "time",
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "duration") {
					if (!durationRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "duration",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "ip") {
					if (!isValidIP(input.data, check.version)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "ip",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "jwt") {
					if (!isValidJWT(input.data, check.alg)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "jwt",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "cidr") {
					if (!isValidCidr(input.data, check.version)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "cidr",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "base64") {
					if (!base64Regex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "base64",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "base64url") {
					if (!base64urlRegex.test(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							validation: "base64url",
							code: ZodIssueCode.invalid_string,
							message: check.message
						});
						status.dirty();
					}
				} else util.assertNever(check);
				return {
					status: status.value,
					value: input.data
				};
			}
			_regex(regex, validation, message) {
				return this.refinement((data) => regex.test(data), {
					validation,
					code: ZodIssueCode.invalid_string,
					...errorUtil.errToObj(message)
				});
			}
			_addCheck(check) {
				return new ZodString({
					...this._def,
					checks: [...this._def.checks, check]
				});
			}
			email(message) {
				return this._addCheck({
					kind: "email",
					...errorUtil.errToObj(message)
				});
			}
			url(message) {
				return this._addCheck({
					kind: "url",
					...errorUtil.errToObj(message)
				});
			}
			emoji(message) {
				return this._addCheck({
					kind: "emoji",
					...errorUtil.errToObj(message)
				});
			}
			uuid(message) {
				return this._addCheck({
					kind: "uuid",
					...errorUtil.errToObj(message)
				});
			}
			nanoid(message) {
				return this._addCheck({
					kind: "nanoid",
					...errorUtil.errToObj(message)
				});
			}
			cuid(message) {
				return this._addCheck({
					kind: "cuid",
					...errorUtil.errToObj(message)
				});
			}
			cuid2(message) {
				return this._addCheck({
					kind: "cuid2",
					...errorUtil.errToObj(message)
				});
			}
			ulid(message) {
				return this._addCheck({
					kind: "ulid",
					...errorUtil.errToObj(message)
				});
			}
			base64(message) {
				return this._addCheck({
					kind: "base64",
					...errorUtil.errToObj(message)
				});
			}
			base64url(message) {
				return this._addCheck({
					kind: "base64url",
					...errorUtil.errToObj(message)
				});
			}
			jwt(options) {
				return this._addCheck({
					kind: "jwt",
					...errorUtil.errToObj(options)
				});
			}
			ip(options) {
				return this._addCheck({
					kind: "ip",
					...errorUtil.errToObj(options)
				});
			}
			cidr(options) {
				return this._addCheck({
					kind: "cidr",
					...errorUtil.errToObj(options)
				});
			}
			datetime(options) {
				if (typeof options === "string") return this._addCheck({
					kind: "datetime",
					precision: null,
					offset: false,
					local: false,
					message: options
				});
				return this._addCheck({
					kind: "datetime",
					precision: typeof options?.precision === "undefined" ? null : options?.precision,
					offset: options?.offset ?? false,
					local: options?.local ?? false,
					...errorUtil.errToObj(options?.message)
				});
			}
			date(message) {
				return this._addCheck({
					kind: "date",
					message
				});
			}
			time(options) {
				if (typeof options === "string") return this._addCheck({
					kind: "time",
					precision: null,
					message: options
				});
				return this._addCheck({
					kind: "time",
					precision: typeof options?.precision === "undefined" ? null : options?.precision,
					...errorUtil.errToObj(options?.message)
				});
			}
			duration(message) {
				return this._addCheck({
					kind: "duration",
					...errorUtil.errToObj(message)
				});
			}
			regex(regex, message) {
				return this._addCheck({
					kind: "regex",
					regex,
					...errorUtil.errToObj(message)
				});
			}
			includes(value, options) {
				return this._addCheck({
					kind: "includes",
					value,
					position: options?.position,
					...errorUtil.errToObj(options?.message)
				});
			}
			startsWith(value, message) {
				return this._addCheck({
					kind: "startsWith",
					value,
					...errorUtil.errToObj(message)
				});
			}
			endsWith(value, message) {
				return this._addCheck({
					kind: "endsWith",
					value,
					...errorUtil.errToObj(message)
				});
			}
			min(minLength, message) {
				return this._addCheck({
					kind: "min",
					value: minLength,
					...errorUtil.errToObj(message)
				});
			}
			max(maxLength, message) {
				return this._addCheck({
					kind: "max",
					value: maxLength,
					...errorUtil.errToObj(message)
				});
			}
			length(len, message) {
				return this._addCheck({
					kind: "length",
					value: len,
					...errorUtil.errToObj(message)
				});
			}
			/**
			* Equivalent to `.min(1)`
			*/
			nonempty(message) {
				return this.min(1, errorUtil.errToObj(message));
			}
			trim() {
				return new ZodString({
					...this._def,
					checks: [...this._def.checks, { kind: "trim" }]
				});
			}
			toLowerCase() {
				return new ZodString({
					...this._def,
					checks: [...this._def.checks, { kind: "toLowerCase" }]
				});
			}
			toUpperCase() {
				return new ZodString({
					...this._def,
					checks: [...this._def.checks, { kind: "toUpperCase" }]
				});
			}
			get isDatetime() {
				return !!this._def.checks.find((ch) => ch.kind === "datetime");
			}
			get isDate() {
				return !!this._def.checks.find((ch) => ch.kind === "date");
			}
			get isTime() {
				return !!this._def.checks.find((ch) => ch.kind === "time");
			}
			get isDuration() {
				return !!this._def.checks.find((ch) => ch.kind === "duration");
			}
			get isEmail() {
				return !!this._def.checks.find((ch) => ch.kind === "email");
			}
			get isURL() {
				return !!this._def.checks.find((ch) => ch.kind === "url");
			}
			get isEmoji() {
				return !!this._def.checks.find((ch) => ch.kind === "emoji");
			}
			get isUUID() {
				return !!this._def.checks.find((ch) => ch.kind === "uuid");
			}
			get isNANOID() {
				return !!this._def.checks.find((ch) => ch.kind === "nanoid");
			}
			get isCUID() {
				return !!this._def.checks.find((ch) => ch.kind === "cuid");
			}
			get isCUID2() {
				return !!this._def.checks.find((ch) => ch.kind === "cuid2");
			}
			get isULID() {
				return !!this._def.checks.find((ch) => ch.kind === "ulid");
			}
			get isIP() {
				return !!this._def.checks.find((ch) => ch.kind === "ip");
			}
			get isCIDR() {
				return !!this._def.checks.find((ch) => ch.kind === "cidr");
			}
			get isBase64() {
				return !!this._def.checks.find((ch) => ch.kind === "base64");
			}
			get isBase64url() {
				return !!this._def.checks.find((ch) => ch.kind === "base64url");
			}
			get minLength() {
				let min = null;
				for (const ch of this._def.checks) if (ch.kind === "min") {
					if (min === null || ch.value > min) min = ch.value;
				}
				return min;
			}
			get maxLength() {
				let max = null;
				for (const ch of this._def.checks) if (ch.kind === "max") {
					if (max === null || ch.value < max) max = ch.value;
				}
				return max;
			}
		};
		ZodString.create = (params) => {
			return new ZodString({
				checks: [],
				typeName: ZodFirstPartyTypeKind.ZodString,
				coerce: params?.coerce ?? false,
				...processCreateParams(params)
			});
		};
		function floatSafeRemainder(val, step) {
			const valDecCount = (val.toString().split(".")[1] || "").length;
			const stepDecCount = (step.toString().split(".")[1] || "").length;
			const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
			return Number.parseInt(val.toFixed(decCount).replace(".", "")) % Number.parseInt(step.toFixed(decCount).replace(".", "")) / 10 ** decCount;
		}
		var ZodNumber = class ZodNumber extends ZodType {
			constructor() {
				super(...arguments);
				this.min = this.gte;
				this.max = this.lte;
				this.step = this.multipleOf;
			}
			_parse(input) {
				if (this._def.coerce) input.data = Number(input.data);
				if (this._getType(input) !== ZodParsedType.number) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.number,
						received: ctx.parsedType
					});
					return INVALID;
				}
				let ctx = void 0;
				const status = new ParseStatus();
				for (const check of this._def.checks) if (check.kind === "int") {
					if (!util.isInteger(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.invalid_type,
							expected: "integer",
							received: "float",
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "min") {
					if (check.inclusive ? input.data < check.value : input.data <= check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							minimum: check.value,
							type: "number",
							inclusive: check.inclusive,
							exact: false,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "max") {
					if (check.inclusive ? input.data > check.value : input.data >= check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							maximum: check.value,
							type: "number",
							inclusive: check.inclusive,
							exact: false,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "multipleOf") {
					if (floatSafeRemainder(input.data, check.value) !== 0) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.not_multiple_of,
							multipleOf: check.value,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "finite") {
					if (!Number.isFinite(input.data)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.not_finite,
							message: check.message
						});
						status.dirty();
					}
				} else util.assertNever(check);
				return {
					status: status.value,
					value: input.data
				};
			}
			gte(value, message) {
				return this.setLimit("min", value, true, errorUtil.toString(message));
			}
			gt(value, message) {
				return this.setLimit("min", value, false, errorUtil.toString(message));
			}
			lte(value, message) {
				return this.setLimit("max", value, true, errorUtil.toString(message));
			}
			lt(value, message) {
				return this.setLimit("max", value, false, errorUtil.toString(message));
			}
			setLimit(kind, value, inclusive, message) {
				return new ZodNumber({
					...this._def,
					checks: [...this._def.checks, {
						kind,
						value,
						inclusive,
						message: errorUtil.toString(message)
					}]
				});
			}
			_addCheck(check) {
				return new ZodNumber({
					...this._def,
					checks: [...this._def.checks, check]
				});
			}
			int(message) {
				return this._addCheck({
					kind: "int",
					message: errorUtil.toString(message)
				});
			}
			positive(message) {
				return this._addCheck({
					kind: "min",
					value: 0,
					inclusive: false,
					message: errorUtil.toString(message)
				});
			}
			negative(message) {
				return this._addCheck({
					kind: "max",
					value: 0,
					inclusive: false,
					message: errorUtil.toString(message)
				});
			}
			nonpositive(message) {
				return this._addCheck({
					kind: "max",
					value: 0,
					inclusive: true,
					message: errorUtil.toString(message)
				});
			}
			nonnegative(message) {
				return this._addCheck({
					kind: "min",
					value: 0,
					inclusive: true,
					message: errorUtil.toString(message)
				});
			}
			multipleOf(value, message) {
				return this._addCheck({
					kind: "multipleOf",
					value,
					message: errorUtil.toString(message)
				});
			}
			finite(message) {
				return this._addCheck({
					kind: "finite",
					message: errorUtil.toString(message)
				});
			}
			safe(message) {
				return this._addCheck({
					kind: "min",
					inclusive: true,
					value: Number.MIN_SAFE_INTEGER,
					message: errorUtil.toString(message)
				})._addCheck({
					kind: "max",
					inclusive: true,
					value: Number.MAX_SAFE_INTEGER,
					message: errorUtil.toString(message)
				});
			}
			get minValue() {
				let min = null;
				for (const ch of this._def.checks) if (ch.kind === "min") {
					if (min === null || ch.value > min) min = ch.value;
				}
				return min;
			}
			get maxValue() {
				let max = null;
				for (const ch of this._def.checks) if (ch.kind === "max") {
					if (max === null || ch.value < max) max = ch.value;
				}
				return max;
			}
			get isInt() {
				return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
			}
			get isFinite() {
				let max = null;
				let min = null;
				for (const ch of this._def.checks) if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") return true;
				else if (ch.kind === "min") {
					if (min === null || ch.value > min) min = ch.value;
				} else if (ch.kind === "max") {
					if (max === null || ch.value < max) max = ch.value;
				}
				return Number.isFinite(min) && Number.isFinite(max);
			}
		};
		ZodNumber.create = (params) => {
			return new ZodNumber({
				checks: [],
				typeName: ZodFirstPartyTypeKind.ZodNumber,
				coerce: params?.coerce || false,
				...processCreateParams(params)
			});
		};
		var ZodBigInt = class ZodBigInt extends ZodType {
			constructor() {
				super(...arguments);
				this.min = this.gte;
				this.max = this.lte;
			}
			_parse(input) {
				if (this._def.coerce) try {
					input.data = BigInt(input.data);
				} catch {
					return this._getInvalidInput(input);
				}
				if (this._getType(input) !== ZodParsedType.bigint) return this._getInvalidInput(input);
				let ctx = void 0;
				const status = new ParseStatus();
				for (const check of this._def.checks) if (check.kind === "min") {
					if (check.inclusive ? input.data < check.value : input.data <= check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							type: "bigint",
							minimum: check.value,
							inclusive: check.inclusive,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "max") {
					if (check.inclusive ? input.data > check.value : input.data >= check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							type: "bigint",
							maximum: check.value,
							inclusive: check.inclusive,
							message: check.message
						});
						status.dirty();
					}
				} else if (check.kind === "multipleOf") {
					if (input.data % check.value !== BigInt(0)) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.not_multiple_of,
							multipleOf: check.value,
							message: check.message
						});
						status.dirty();
					}
				} else util.assertNever(check);
				return {
					status: status.value,
					value: input.data
				};
			}
			_getInvalidInput(input) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.bigint,
					received: ctx.parsedType
				});
				return INVALID;
			}
			gte(value, message) {
				return this.setLimit("min", value, true, errorUtil.toString(message));
			}
			gt(value, message) {
				return this.setLimit("min", value, false, errorUtil.toString(message));
			}
			lte(value, message) {
				return this.setLimit("max", value, true, errorUtil.toString(message));
			}
			lt(value, message) {
				return this.setLimit("max", value, false, errorUtil.toString(message));
			}
			setLimit(kind, value, inclusive, message) {
				return new ZodBigInt({
					...this._def,
					checks: [...this._def.checks, {
						kind,
						value,
						inclusive,
						message: errorUtil.toString(message)
					}]
				});
			}
			_addCheck(check) {
				return new ZodBigInt({
					...this._def,
					checks: [...this._def.checks, check]
				});
			}
			positive(message) {
				return this._addCheck({
					kind: "min",
					value: BigInt(0),
					inclusive: false,
					message: errorUtil.toString(message)
				});
			}
			negative(message) {
				return this._addCheck({
					kind: "max",
					value: BigInt(0),
					inclusive: false,
					message: errorUtil.toString(message)
				});
			}
			nonpositive(message) {
				return this._addCheck({
					kind: "max",
					value: BigInt(0),
					inclusive: true,
					message: errorUtil.toString(message)
				});
			}
			nonnegative(message) {
				return this._addCheck({
					kind: "min",
					value: BigInt(0),
					inclusive: true,
					message: errorUtil.toString(message)
				});
			}
			multipleOf(value, message) {
				return this._addCheck({
					kind: "multipleOf",
					value,
					message: errorUtil.toString(message)
				});
			}
			get minValue() {
				let min = null;
				for (const ch of this._def.checks) if (ch.kind === "min") {
					if (min === null || ch.value > min) min = ch.value;
				}
				return min;
			}
			get maxValue() {
				let max = null;
				for (const ch of this._def.checks) if (ch.kind === "max") {
					if (max === null || ch.value < max) max = ch.value;
				}
				return max;
			}
		};
		ZodBigInt.create = (params) => {
			return new ZodBigInt({
				checks: [],
				typeName: ZodFirstPartyTypeKind.ZodBigInt,
				coerce: params?.coerce ?? false,
				...processCreateParams(params)
			});
		};
		var ZodBoolean = class extends ZodType {
			_parse(input) {
				if (this._def.coerce) input.data = Boolean(input.data);
				if (this._getType(input) !== ZodParsedType.boolean) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.boolean,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return OK(input.data);
			}
		};
		ZodBoolean.create = (params) => {
			return new ZodBoolean({
				typeName: ZodFirstPartyTypeKind.ZodBoolean,
				coerce: params?.coerce || false,
				...processCreateParams(params)
			});
		};
		var ZodDate = class ZodDate extends ZodType {
			_parse(input) {
				if (this._def.coerce) input.data = new Date(input.data);
				if (this._getType(input) !== ZodParsedType.date) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.date,
						received: ctx.parsedType
					});
					return INVALID;
				}
				if (Number.isNaN(input.data.getTime())) {
					addIssueToContext(this._getOrReturnCtx(input), { code: ZodIssueCode.invalid_date });
					return INVALID;
				}
				const status = new ParseStatus();
				let ctx = void 0;
				for (const check of this._def.checks) if (check.kind === "min") {
					if (input.data.getTime() < check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							message: check.message,
							inclusive: true,
							exact: false,
							minimum: check.value,
							type: "date"
						});
						status.dirty();
					}
				} else if (check.kind === "max") {
					if (input.data.getTime() > check.value) {
						ctx = this._getOrReturnCtx(input, ctx);
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							message: check.message,
							inclusive: true,
							exact: false,
							maximum: check.value,
							type: "date"
						});
						status.dirty();
					}
				} else util.assertNever(check);
				return {
					status: status.value,
					value: new Date(input.data.getTime())
				};
			}
			_addCheck(check) {
				return new ZodDate({
					...this._def,
					checks: [...this._def.checks, check]
				});
			}
			min(minDate, message) {
				return this._addCheck({
					kind: "min",
					value: minDate.getTime(),
					message: errorUtil.toString(message)
				});
			}
			max(maxDate, message) {
				return this._addCheck({
					kind: "max",
					value: maxDate.getTime(),
					message: errorUtil.toString(message)
				});
			}
			get minDate() {
				let min = null;
				for (const ch of this._def.checks) if (ch.kind === "min") {
					if (min === null || ch.value > min) min = ch.value;
				}
				return min != null ? new Date(min) : null;
			}
			get maxDate() {
				let max = null;
				for (const ch of this._def.checks) if (ch.kind === "max") {
					if (max === null || ch.value < max) max = ch.value;
				}
				return max != null ? new Date(max) : null;
			}
		};
		ZodDate.create = (params) => {
			return new ZodDate({
				checks: [],
				coerce: params?.coerce || false,
				typeName: ZodFirstPartyTypeKind.ZodDate,
				...processCreateParams(params)
			});
		};
		var ZodSymbol = class extends ZodType {
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.symbol) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.symbol,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return OK(input.data);
			}
		};
		ZodSymbol.create = (params) => {
			return new ZodSymbol({
				typeName: ZodFirstPartyTypeKind.ZodSymbol,
				...processCreateParams(params)
			});
		};
		var ZodUndefined = class extends ZodType {
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.undefined) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.undefined,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return OK(input.data);
			}
		};
		ZodUndefined.create = (params) => {
			return new ZodUndefined({
				typeName: ZodFirstPartyTypeKind.ZodUndefined,
				...processCreateParams(params)
			});
		};
		var ZodNull = class extends ZodType {
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.null) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.null,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return OK(input.data);
			}
		};
		ZodNull.create = (params) => {
			return new ZodNull({
				typeName: ZodFirstPartyTypeKind.ZodNull,
				...processCreateParams(params)
			});
		};
		var ZodAny = class extends ZodType {
			constructor() {
				super(...arguments);
				this._any = true;
			}
			_parse(input) {
				return OK(input.data);
			}
		};
		ZodAny.create = (params) => {
			return new ZodAny({
				typeName: ZodFirstPartyTypeKind.ZodAny,
				...processCreateParams(params)
			});
		};
		var ZodUnknown = class extends ZodType {
			constructor() {
				super(...arguments);
				this._unknown = true;
			}
			_parse(input) {
				return OK(input.data);
			}
		};
		ZodUnknown.create = (params) => {
			return new ZodUnknown({
				typeName: ZodFirstPartyTypeKind.ZodUnknown,
				...processCreateParams(params)
			});
		};
		var ZodNever = class extends ZodType {
			_parse(input) {
				const ctx = this._getOrReturnCtx(input);
				addIssueToContext(ctx, {
					code: ZodIssueCode.invalid_type,
					expected: ZodParsedType.never,
					received: ctx.parsedType
				});
				return INVALID;
			}
		};
		ZodNever.create = (params) => {
			return new ZodNever({
				typeName: ZodFirstPartyTypeKind.ZodNever,
				...processCreateParams(params)
			});
		};
		var ZodVoid = class extends ZodType {
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.undefined) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.void,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return OK(input.data);
			}
		};
		ZodVoid.create = (params) => {
			return new ZodVoid({
				typeName: ZodFirstPartyTypeKind.ZodVoid,
				...processCreateParams(params)
			});
		};
		var ZodArray = class ZodArray extends ZodType {
			_parse(input) {
				const { ctx, status } = this._processInputParams(input);
				const def = this._def;
				if (ctx.parsedType !== ZodParsedType.array) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.array,
						received: ctx.parsedType
					});
					return INVALID;
				}
				if (def.exactLength !== null) {
					const tooBig = ctx.data.length > def.exactLength.value;
					const tooSmall = ctx.data.length < def.exactLength.value;
					if (tooBig || tooSmall) {
						addIssueToContext(ctx, {
							code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
							minimum: tooSmall ? def.exactLength.value : void 0,
							maximum: tooBig ? def.exactLength.value : void 0,
							type: "array",
							inclusive: true,
							exact: true,
							message: def.exactLength.message
						});
						status.dirty();
					}
				}
				if (def.minLength !== null) {
					if (ctx.data.length < def.minLength.value) {
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							minimum: def.minLength.value,
							type: "array",
							inclusive: true,
							exact: false,
							message: def.minLength.message
						});
						status.dirty();
					}
				}
				if (def.maxLength !== null) {
					if (ctx.data.length > def.maxLength.value) {
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							maximum: def.maxLength.value,
							type: "array",
							inclusive: true,
							exact: false,
							message: def.maxLength.message
						});
						status.dirty();
					}
				}
				if (ctx.common.async) return Promise.all([...ctx.data].map((item, i) => {
					return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
				})).then((result) => {
					return ParseStatus.mergeArray(status, result);
				});
				const result = [...ctx.data].map((item, i) => {
					return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
				});
				return ParseStatus.mergeArray(status, result);
			}
			get element() {
				return this._def.type;
			}
			min(minLength, message) {
				return new ZodArray({
					...this._def,
					minLength: {
						value: minLength,
						message: errorUtil.toString(message)
					}
				});
			}
			max(maxLength, message) {
				return new ZodArray({
					...this._def,
					maxLength: {
						value: maxLength,
						message: errorUtil.toString(message)
					}
				});
			}
			length(len, message) {
				return new ZodArray({
					...this._def,
					exactLength: {
						value: len,
						message: errorUtil.toString(message)
					}
				});
			}
			nonempty(message) {
				return this.min(1, message);
			}
		};
		ZodArray.create = (schema, params) => {
			return new ZodArray({
				type: schema,
				minLength: null,
				maxLength: null,
				exactLength: null,
				typeName: ZodFirstPartyTypeKind.ZodArray,
				...processCreateParams(params)
			});
		};
		function deepPartialify(schema) {
			if (schema instanceof ZodObject) {
				const newShape = {};
				for (const key in schema.shape) {
					const fieldSchema = schema.shape[key];
					newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
				}
				return new ZodObject({
					...schema._def,
					shape: () => newShape
				});
			} else if (schema instanceof ZodArray) return new ZodArray({
				...schema._def,
				type: deepPartialify(schema.element)
			});
			else if (schema instanceof ZodOptional) return ZodOptional.create(deepPartialify(schema.unwrap()));
			else if (schema instanceof ZodNullable) return ZodNullable.create(deepPartialify(schema.unwrap()));
			else if (schema instanceof ZodTuple) return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
			else return schema;
		}
		var ZodObject = class ZodObject extends ZodType {
			constructor() {
				super(...arguments);
				this._cached = null;
				/**
				* @deprecated In most cases, this is no longer needed - unknown properties are now silently stripped.
				* If you want to pass through unknown properties, use `.passthrough()` instead.
				*/
				this.nonstrict = this.passthrough;
				/**
				* @deprecated Use `.extend` instead
				*  */
				this.augment = this.extend;
			}
			_getCached() {
				if (this._cached !== null) return this._cached;
				const shape = this._def.shape();
				const keys = util.objectKeys(shape);
				this._cached = {
					shape,
					keys
				};
				return this._cached;
			}
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.object) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.object,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const { status, ctx } = this._processInputParams(input);
				const { shape, keys: shapeKeys } = this._getCached();
				const extraKeys = [];
				if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
					for (const key in ctx.data) if (!shapeKeys.includes(key)) extraKeys.push(key);
				}
				const pairs = [];
				for (const key of shapeKeys) {
					const keyValidator = shape[key];
					const value = ctx.data[key];
					pairs.push({
						key: {
							status: "valid",
							value: key
						},
						value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
						alwaysSet: key in ctx.data
					});
				}
				if (this._def.catchall instanceof ZodNever) {
					const unknownKeys = this._def.unknownKeys;
					if (unknownKeys === "passthrough") for (const key of extraKeys) pairs.push({
						key: {
							status: "valid",
							value: key
						},
						value: {
							status: "valid",
							value: ctx.data[key]
						}
					});
					else if (unknownKeys === "strict") {
						if (extraKeys.length > 0) {
							addIssueToContext(ctx, {
								code: ZodIssueCode.unrecognized_keys,
								keys: extraKeys
							});
							status.dirty();
						}
					} else if (unknownKeys === "strip") {} else throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
				} else {
					const catchall = this._def.catchall;
					for (const key of extraKeys) {
						const value = ctx.data[key];
						pairs.push({
							key: {
								status: "valid",
								value: key
							},
							value: catchall._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
							alwaysSet: key in ctx.data
						});
					}
				}
				if (ctx.common.async) return Promise.resolve().then(async () => {
					const syncPairs = [];
					for (const pair of pairs) {
						const key = await pair.key;
						const value = await pair.value;
						syncPairs.push({
							key,
							value,
							alwaysSet: pair.alwaysSet
						});
					}
					return syncPairs;
				}).then((syncPairs) => {
					return ParseStatus.mergeObjectSync(status, syncPairs);
				});
				else return ParseStatus.mergeObjectSync(status, pairs);
			}
			get shape() {
				return this._def.shape();
			}
			strict(message) {
				errorUtil.errToObj;
				return new ZodObject({
					...this._def,
					unknownKeys: "strict",
					...message !== void 0 ? { errorMap: (issue, ctx) => {
						const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
						if (issue.code === "unrecognized_keys") return { message: errorUtil.errToObj(message).message ?? defaultError };
						return { message: defaultError };
					} } : {}
				});
			}
			strip() {
				return new ZodObject({
					...this._def,
					unknownKeys: "strip"
				});
			}
			passthrough() {
				return new ZodObject({
					...this._def,
					unknownKeys: "passthrough"
				});
			}
			extend(augmentation) {
				return new ZodObject({
					...this._def,
					shape: () => ({
						...this._def.shape(),
						...augmentation
					})
				});
			}
			/**
			* Prior to zod@1.0.12 there was a bug in the
			* inferred type of merged objects. Please
			* upgrade if you are experiencing issues.
			*/
			merge(merging) {
				return new ZodObject({
					unknownKeys: merging._def.unknownKeys,
					catchall: merging._def.catchall,
					shape: () => ({
						...this._def.shape(),
						...merging._def.shape()
					}),
					typeName: ZodFirstPartyTypeKind.ZodObject
				});
			}
			setKey(key, schema) {
				return this.augment({ [key]: schema });
			}
			catchall(index) {
				return new ZodObject({
					...this._def,
					catchall: index
				});
			}
			pick(mask) {
				const shape = {};
				for (const key of util.objectKeys(mask)) if (mask[key] && this.shape[key]) shape[key] = this.shape[key];
				return new ZodObject({
					...this._def,
					shape: () => shape
				});
			}
			omit(mask) {
				const shape = {};
				for (const key of util.objectKeys(this.shape)) if (!mask[key]) shape[key] = this.shape[key];
				return new ZodObject({
					...this._def,
					shape: () => shape
				});
			}
			/**
			* @deprecated
			*/
			deepPartial() {
				return deepPartialify(this);
			}
			partial(mask) {
				const newShape = {};
				for (const key of util.objectKeys(this.shape)) {
					const fieldSchema = this.shape[key];
					if (mask && !mask[key]) newShape[key] = fieldSchema;
					else newShape[key] = fieldSchema.optional();
				}
				return new ZodObject({
					...this._def,
					shape: () => newShape
				});
			}
			required(mask) {
				const newShape = {};
				for (const key of util.objectKeys(this.shape)) if (mask && !mask[key]) newShape[key] = this.shape[key];
				else {
					let newField = this.shape[key];
					while (newField instanceof ZodOptional) newField = newField._def.innerType;
					newShape[key] = newField;
				}
				return new ZodObject({
					...this._def,
					shape: () => newShape
				});
			}
			keyof() {
				return createZodEnum(util.objectKeys(this.shape));
			}
		};
		ZodObject.create = (shape, params) => {
			return new ZodObject({
				shape: () => shape,
				unknownKeys: "strip",
				catchall: ZodNever.create(),
				typeName: ZodFirstPartyTypeKind.ZodObject,
				...processCreateParams(params)
			});
		};
		ZodObject.strictCreate = (shape, params) => {
			return new ZodObject({
				shape: () => shape,
				unknownKeys: "strict",
				catchall: ZodNever.create(),
				typeName: ZodFirstPartyTypeKind.ZodObject,
				...processCreateParams(params)
			});
		};
		ZodObject.lazycreate = (shape, params) => {
			return new ZodObject({
				shape,
				unknownKeys: "strip",
				catchall: ZodNever.create(),
				typeName: ZodFirstPartyTypeKind.ZodObject,
				...processCreateParams(params)
			});
		};
		var ZodUnion = class extends ZodType {
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				const options = this._def.options;
				function handleResults(results) {
					for (const result of results) if (result.result.status === "valid") return result.result;
					for (const result of results) if (result.result.status === "dirty") {
						ctx.common.issues.push(...result.ctx.common.issues);
						return result.result;
					}
					const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_union,
						unionErrors
					});
					return INVALID;
				}
				if (ctx.common.async) return Promise.all(options.map(async (option) => {
					const childCtx = {
						...ctx,
						common: {
							...ctx.common,
							issues: []
						},
						parent: null
					};
					return {
						result: await option._parseAsync({
							data: ctx.data,
							path: ctx.path,
							parent: childCtx
						}),
						ctx: childCtx
					};
				})).then(handleResults);
				else {
					let dirty = void 0;
					const issues = [];
					for (const option of options) {
						const childCtx = {
							...ctx,
							common: {
								...ctx.common,
								issues: []
							},
							parent: null
						};
						const result = option._parseSync({
							data: ctx.data,
							path: ctx.path,
							parent: childCtx
						});
						if (result.status === "valid") return result;
						else if (result.status === "dirty" && !dirty) dirty = {
							result,
							ctx: childCtx
						};
						if (childCtx.common.issues.length) issues.push(childCtx.common.issues);
					}
					if (dirty) {
						ctx.common.issues.push(...dirty.ctx.common.issues);
						return dirty.result;
					}
					const unionErrors = issues.map((issues) => new ZodError(issues));
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_union,
						unionErrors
					});
					return INVALID;
				}
			}
			get options() {
				return this._def.options;
			}
		};
		ZodUnion.create = (types, params) => {
			return new ZodUnion({
				options: types,
				typeName: ZodFirstPartyTypeKind.ZodUnion,
				...processCreateParams(params)
			});
		};
		const getDiscriminator = (type) => {
			if (type instanceof ZodLazy) return getDiscriminator(type.schema);
			else if (type instanceof ZodEffects) return getDiscriminator(type.innerType());
			else if (type instanceof ZodLiteral) return [type.value];
			else if (type instanceof ZodEnum) return type.options;
			else if (type instanceof ZodNativeEnum) return util.objectValues(type.enum);
			else if (type instanceof ZodDefault) return getDiscriminator(type._def.innerType);
			else if (type instanceof ZodUndefined) return [void 0];
			else if (type instanceof ZodNull) return [null];
			else if (type instanceof ZodOptional) return [void 0, ...getDiscriminator(type.unwrap())];
			else if (type instanceof ZodNullable) return [null, ...getDiscriminator(type.unwrap())];
			else if (type instanceof ZodBranded) return getDiscriminator(type.unwrap());
			else if (type instanceof ZodReadonly) return getDiscriminator(type.unwrap());
			else if (type instanceof ZodCatch) return getDiscriminator(type._def.innerType);
			else return [];
		};
		var ZodDiscriminatedUnion = class ZodDiscriminatedUnion extends ZodType {
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.object) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.object,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const discriminator = this.discriminator;
				const discriminatorValue = ctx.data[discriminator];
				const option = this.optionsMap.get(discriminatorValue);
				if (!option) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_union_discriminator,
						options: Array.from(this.optionsMap.keys()),
						path: [discriminator]
					});
					return INVALID;
				}
				if (ctx.common.async) return option._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
				else return option._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
			}
			get discriminator() {
				return this._def.discriminator;
			}
			get options() {
				return this._def.options;
			}
			get optionsMap() {
				return this._def.optionsMap;
			}
			/**
			* The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
			* However, it only allows a union of objects, all of which need to share a discriminator property. This property must
			* have a different value for each object in the union.
			* @param discriminator the name of the discriminator property
			* @param types an array of object schemas
			* @param params
			*/
			static create(discriminator, options, params) {
				const optionsMap = /* @__PURE__ */ new Map();
				for (const type of options) {
					const discriminatorValues = getDiscriminator(type.shape[discriminator]);
					if (!discriminatorValues.length) throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
					for (const value of discriminatorValues) {
						if (optionsMap.has(value)) throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
						optionsMap.set(value, type);
					}
				}
				return new ZodDiscriminatedUnion({
					typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
					discriminator,
					options,
					optionsMap,
					...processCreateParams(params)
				});
			}
		};
		function mergeValues(a, b) {
			const aType = getParsedType(a);
			const bType = getParsedType(b);
			if (a === b) return {
				valid: true,
				data: a
			};
			else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
				const bKeys = util.objectKeys(b);
				const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return { valid: false };
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			} else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
				if (a.length !== b.length) return { valid: false };
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return { valid: false };
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			} else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) return {
				valid: true,
				data: a
			};
			else return { valid: false };
		}
		var ZodIntersection = class extends ZodType {
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				const handleParsed = (parsedLeft, parsedRight) => {
					if (isAborted(parsedLeft) || isAborted(parsedRight)) return INVALID;
					const merged = mergeValues(parsedLeft.value, parsedRight.value);
					if (!merged.valid) {
						addIssueToContext(ctx, { code: ZodIssueCode.invalid_intersection_types });
						return INVALID;
					}
					if (isDirty(parsedLeft) || isDirty(parsedRight)) status.dirty();
					return {
						status: status.value,
						value: merged.data
					};
				};
				if (ctx.common.async) return Promise.all([this._def.left._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}), this._def.right._parseAsync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				})]).then(([left, right]) => handleParsed(left, right));
				else return handleParsed(this._def.left._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}), this._def.right._parseSync({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				}));
			}
		};
		ZodIntersection.create = (left, right, params) => {
			return new ZodIntersection({
				left,
				right,
				typeName: ZodFirstPartyTypeKind.ZodIntersection,
				...processCreateParams(params)
			});
		};
		var ZodTuple = class ZodTuple extends ZodType {
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.array) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.array,
						received: ctx.parsedType
					});
					return INVALID;
				}
				if (ctx.data.length < this._def.items.length) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_small,
						minimum: this._def.items.length,
						inclusive: true,
						exact: false,
						type: "array"
					});
					return INVALID;
				}
				if (!this._def.rest && ctx.data.length > this._def.items.length) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.too_big,
						maximum: this._def.items.length,
						inclusive: true,
						exact: false,
						type: "array"
					});
					status.dirty();
				}
				const items = [...ctx.data].map((item, itemIndex) => {
					const schema = this._def.items[itemIndex] || this._def.rest;
					if (!schema) return null;
					return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
				}).filter((x) => !!x);
				if (ctx.common.async) return Promise.all(items).then((results) => {
					return ParseStatus.mergeArray(status, results);
				});
				else return ParseStatus.mergeArray(status, items);
			}
			get items() {
				return this._def.items;
			}
			rest(rest) {
				return new ZodTuple({
					...this._def,
					rest
				});
			}
		};
		ZodTuple.create = (schemas, params) => {
			if (!Array.isArray(schemas)) throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
			return new ZodTuple({
				items: schemas,
				typeName: ZodFirstPartyTypeKind.ZodTuple,
				rest: null,
				...processCreateParams(params)
			});
		};
		var ZodRecord = class ZodRecord extends ZodType {
			get keySchema() {
				return this._def.keyType;
			}
			get valueSchema() {
				return this._def.valueType;
			}
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.object) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.object,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const pairs = [];
				const keyType = this._def.keyType;
				const valueType = this._def.valueType;
				for (const key in ctx.data) pairs.push({
					key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
					value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
					alwaysSet: key in ctx.data
				});
				if (ctx.common.async) return ParseStatus.mergeObjectAsync(status, pairs);
				else return ParseStatus.mergeObjectSync(status, pairs);
			}
			get element() {
				return this._def.valueType;
			}
			static create(first, second, third) {
				if (second instanceof ZodType) return new ZodRecord({
					keyType: first,
					valueType: second,
					typeName: ZodFirstPartyTypeKind.ZodRecord,
					...processCreateParams(third)
				});
				return new ZodRecord({
					keyType: ZodString.create(),
					valueType: first,
					typeName: ZodFirstPartyTypeKind.ZodRecord,
					...processCreateParams(second)
				});
			}
		};
		var ZodMap = class extends ZodType {
			get keySchema() {
				return this._def.keyType;
			}
			get valueSchema() {
				return this._def.valueType;
			}
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.map) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.map,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const keyType = this._def.keyType;
				const valueType = this._def.valueType;
				const pairs = [...ctx.data.entries()].map(([key, value], index) => {
					return {
						key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
						value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
					};
				});
				if (ctx.common.async) {
					const finalMap = /* @__PURE__ */ new Map();
					return Promise.resolve().then(async () => {
						for (const pair of pairs) {
							const key = await pair.key;
							const value = await pair.value;
							if (key.status === "aborted" || value.status === "aborted") return INVALID;
							if (key.status === "dirty" || value.status === "dirty") status.dirty();
							finalMap.set(key.value, value.value);
						}
						return {
							status: status.value,
							value: finalMap
						};
					});
				} else {
					const finalMap = /* @__PURE__ */ new Map();
					for (const pair of pairs) {
						const key = pair.key;
						const value = pair.value;
						if (key.status === "aborted" || value.status === "aborted") return INVALID;
						if (key.status === "dirty" || value.status === "dirty") status.dirty();
						finalMap.set(key.value, value.value);
					}
					return {
						status: status.value,
						value: finalMap
					};
				}
			}
		};
		ZodMap.create = (keyType, valueType, params) => {
			return new ZodMap({
				valueType,
				keyType,
				typeName: ZodFirstPartyTypeKind.ZodMap,
				...processCreateParams(params)
			});
		};
		var ZodSet = class ZodSet extends ZodType {
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.set) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.set,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const def = this._def;
				if (def.minSize !== null) {
					if (ctx.data.size < def.minSize.value) {
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_small,
							minimum: def.minSize.value,
							type: "set",
							inclusive: true,
							exact: false,
							message: def.minSize.message
						});
						status.dirty();
					}
				}
				if (def.maxSize !== null) {
					if (ctx.data.size > def.maxSize.value) {
						addIssueToContext(ctx, {
							code: ZodIssueCode.too_big,
							maximum: def.maxSize.value,
							type: "set",
							inclusive: true,
							exact: false,
							message: def.maxSize.message
						});
						status.dirty();
					}
				}
				const valueType = this._def.valueType;
				function finalizeSet(elements) {
					const parsedSet = /* @__PURE__ */ new Set();
					for (const element of elements) {
						if (element.status === "aborted") return INVALID;
						if (element.status === "dirty") status.dirty();
						parsedSet.add(element.value);
					}
					return {
						status: status.value,
						value: parsedSet
					};
				}
				const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
				if (ctx.common.async) return Promise.all(elements).then((elements) => finalizeSet(elements));
				else return finalizeSet(elements);
			}
			min(minSize, message) {
				return new ZodSet({
					...this._def,
					minSize: {
						value: minSize,
						message: errorUtil.toString(message)
					}
				});
			}
			max(maxSize, message) {
				return new ZodSet({
					...this._def,
					maxSize: {
						value: maxSize,
						message: errorUtil.toString(message)
					}
				});
			}
			size(size, message) {
				return this.min(size, message).max(size, message);
			}
			nonempty(message) {
				return this.min(1, message);
			}
		};
		ZodSet.create = (valueType, params) => {
			return new ZodSet({
				valueType,
				minSize: null,
				maxSize: null,
				typeName: ZodFirstPartyTypeKind.ZodSet,
				...processCreateParams(params)
			});
		};
		var ZodFunction = class ZodFunction extends ZodType {
			constructor() {
				super(...arguments);
				this.validate = this.implement;
			}
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.function) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.function,
						received: ctx.parsedType
					});
					return INVALID;
				}
				function makeArgsIssue(args, error) {
					return makeIssue({
						data: args,
						path: ctx.path,
						errorMaps: [
							ctx.common.contextualErrorMap,
							ctx.schemaErrorMap,
							getErrorMap(),
							errorMap
						].filter((x) => !!x),
						issueData: {
							code: ZodIssueCode.invalid_arguments,
							argumentsError: error
						}
					});
				}
				function makeReturnsIssue(returns, error) {
					return makeIssue({
						data: returns,
						path: ctx.path,
						errorMaps: [
							ctx.common.contextualErrorMap,
							ctx.schemaErrorMap,
							getErrorMap(),
							errorMap
						].filter((x) => !!x),
						issueData: {
							code: ZodIssueCode.invalid_return_type,
							returnTypeError: error
						}
					});
				}
				const params = { errorMap: ctx.common.contextualErrorMap };
				const fn = ctx.data;
				if (this._def.returns instanceof ZodPromise) {
					const me = this;
					return OK(async function(...args) {
						const error = new ZodError([]);
						const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
							error.addIssue(makeArgsIssue(args, e));
							throw error;
						});
						const result = await Reflect.apply(fn, this, parsedArgs);
						return await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
							error.addIssue(makeReturnsIssue(result, e));
							throw error;
						});
					});
				} else {
					const me = this;
					return OK(function(...args) {
						const parsedArgs = me._def.args.safeParse(args, params);
						if (!parsedArgs.success) throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
						const result = Reflect.apply(fn, this, parsedArgs.data);
						const parsedReturns = me._def.returns.safeParse(result, params);
						if (!parsedReturns.success) throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
						return parsedReturns.data;
					});
				}
			}
			parameters() {
				return this._def.args;
			}
			returnType() {
				return this._def.returns;
			}
			args(...items) {
				return new ZodFunction({
					...this._def,
					args: ZodTuple.create(items).rest(ZodUnknown.create())
				});
			}
			returns(returnType) {
				return new ZodFunction({
					...this._def,
					returns: returnType
				});
			}
			implement(func) {
				return this.parse(func);
			}
			strictImplement(func) {
				return this.parse(func);
			}
			static create(args, returns, params) {
				return new ZodFunction({
					args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
					returns: returns || ZodUnknown.create(),
					typeName: ZodFirstPartyTypeKind.ZodFunction,
					...processCreateParams(params)
				});
			}
		};
		var ZodLazy = class extends ZodType {
			get schema() {
				return this._def.getter();
			}
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				return this._def.getter()._parse({
					data: ctx.data,
					path: ctx.path,
					parent: ctx
				});
			}
		};
		ZodLazy.create = (getter, params) => {
			return new ZodLazy({
				getter,
				typeName: ZodFirstPartyTypeKind.ZodLazy,
				...processCreateParams(params)
			});
		};
		var ZodLiteral = class extends ZodType {
			_parse(input) {
				if (input.data !== this._def.value) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						received: ctx.data,
						code: ZodIssueCode.invalid_literal,
						expected: this._def.value
					});
					return INVALID;
				}
				return {
					status: "valid",
					value: input.data
				};
			}
			get value() {
				return this._def.value;
			}
		};
		ZodLiteral.create = (value, params) => {
			return new ZodLiteral({
				value,
				typeName: ZodFirstPartyTypeKind.ZodLiteral,
				...processCreateParams(params)
			});
		};
		function createZodEnum(values, params) {
			return new ZodEnum({
				values,
				typeName: ZodFirstPartyTypeKind.ZodEnum,
				...processCreateParams(params)
			});
		}
		var ZodEnum = class ZodEnum extends ZodType {
			_parse(input) {
				if (typeof input.data !== "string") {
					const ctx = this._getOrReturnCtx(input);
					const expectedValues = this._def.values;
					addIssueToContext(ctx, {
						expected: util.joinValues(expectedValues),
						received: ctx.parsedType,
						code: ZodIssueCode.invalid_type
					});
					return INVALID;
				}
				if (!this._cache) this._cache = new Set(this._def.values);
				if (!this._cache.has(input.data)) {
					const ctx = this._getOrReturnCtx(input);
					const expectedValues = this._def.values;
					addIssueToContext(ctx, {
						received: ctx.data,
						code: ZodIssueCode.invalid_enum_value,
						options: expectedValues
					});
					return INVALID;
				}
				return OK(input.data);
			}
			get options() {
				return this._def.values;
			}
			get enum() {
				const enumValues = {};
				for (const val of this._def.values) enumValues[val] = val;
				return enumValues;
			}
			get Values() {
				const enumValues = {};
				for (const val of this._def.values) enumValues[val] = val;
				return enumValues;
			}
			get Enum() {
				const enumValues = {};
				for (const val of this._def.values) enumValues[val] = val;
				return enumValues;
			}
			extract(values, newDef = this._def) {
				return ZodEnum.create(values, {
					...this._def,
					...newDef
				});
			}
			exclude(values, newDef = this._def) {
				return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
					...this._def,
					...newDef
				});
			}
		};
		ZodEnum.create = createZodEnum;
		var ZodNativeEnum = class extends ZodType {
			_parse(input) {
				const nativeEnumValues = util.getValidEnumValues(this._def.values);
				const ctx = this._getOrReturnCtx(input);
				if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
					const expectedValues = util.objectValues(nativeEnumValues);
					addIssueToContext(ctx, {
						expected: util.joinValues(expectedValues),
						received: ctx.parsedType,
						code: ZodIssueCode.invalid_type
					});
					return INVALID;
				}
				if (!this._cache) this._cache = new Set(util.getValidEnumValues(this._def.values));
				if (!this._cache.has(input.data)) {
					const expectedValues = util.objectValues(nativeEnumValues);
					addIssueToContext(ctx, {
						received: ctx.data,
						code: ZodIssueCode.invalid_enum_value,
						options: expectedValues
					});
					return INVALID;
				}
				return OK(input.data);
			}
			get enum() {
				return this._def.values;
			}
		};
		ZodNativeEnum.create = (values, params) => {
			return new ZodNativeEnum({
				values,
				typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
				...processCreateParams(params)
			});
		};
		var ZodPromise = class extends ZodType {
			unwrap() {
				return this._def.type;
			}
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.promise,
						received: ctx.parsedType
					});
					return INVALID;
				}
				const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
				return OK(promisified.then((data) => {
					return this._def.type.parseAsync(data, {
						path: ctx.path,
						errorMap: ctx.common.contextualErrorMap
					});
				}));
			}
		};
		ZodPromise.create = (schema, params) => {
			return new ZodPromise({
				type: schema,
				typeName: ZodFirstPartyTypeKind.ZodPromise,
				...processCreateParams(params)
			});
		};
		var ZodEffects = class extends ZodType {
			innerType() {
				return this._def.schema;
			}
			sourceType() {
				return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
			}
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				const effect = this._def.effect || null;
				const checkCtx = {
					addIssue: (arg) => {
						addIssueToContext(ctx, arg);
						if (arg.fatal) status.abort();
						else status.dirty();
					},
					get path() {
						return ctx.path;
					}
				};
				checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
				if (effect.type === "preprocess") {
					const processed = effect.transform(ctx.data, checkCtx);
					if (ctx.common.async) return Promise.resolve(processed).then(async (processed) => {
						if (status.value === "aborted") return INVALID;
						const result = await this._def.schema._parseAsync({
							data: processed,
							path: ctx.path,
							parent: ctx
						});
						if (result.status === "aborted") return INVALID;
						if (result.status === "dirty") return DIRTY(result.value);
						if (status.value === "dirty") return DIRTY(result.value);
						return result;
					});
					else {
						if (status.value === "aborted") return INVALID;
						const result = this._def.schema._parseSync({
							data: processed,
							path: ctx.path,
							parent: ctx
						});
						if (result.status === "aborted") return INVALID;
						if (result.status === "dirty") return DIRTY(result.value);
						if (status.value === "dirty") return DIRTY(result.value);
						return result;
					}
				}
				if (effect.type === "refinement") {
					const executeRefinement = (acc) => {
						const result = effect.refinement(acc, checkCtx);
						if (ctx.common.async) return Promise.resolve(result);
						if (result instanceof Promise) throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
						return acc;
					};
					if (ctx.common.async === false) {
						const inner = this._def.schema._parseSync({
							data: ctx.data,
							path: ctx.path,
							parent: ctx
						});
						if (inner.status === "aborted") return INVALID;
						if (inner.status === "dirty") status.dirty();
						executeRefinement(inner.value);
						return {
							status: status.value,
							value: inner.value
						};
					} else return this._def.schema._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					}).then((inner) => {
						if (inner.status === "aborted") return INVALID;
						if (inner.status === "dirty") status.dirty();
						return executeRefinement(inner.value).then(() => {
							return {
								status: status.value,
								value: inner.value
							};
						});
					});
				}
				if (effect.type === "transform") {
					if (ctx.common.async === false) {
						const base = this._def.schema._parseSync({
							data: ctx.data,
							path: ctx.path,
							parent: ctx
						});
						if (!isValid(base)) return INVALID;
						const result = effect.transform(base.value, checkCtx);
						if (result instanceof Promise) throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
						return {
							status: status.value,
							value: result
						};
					} else return this._def.schema._parseAsync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					}).then((base) => {
						if (!isValid(base)) return INVALID;
						return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
							status: status.value,
							value: result
						}));
					});
				}
				util.assertNever(effect);
			}
		};
		ZodEffects.create = (schema, effect, params) => {
			return new ZodEffects({
				schema,
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				effect,
				...processCreateParams(params)
			});
		};
		ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
			return new ZodEffects({
				schema,
				effect: {
					type: "preprocess",
					transform: preprocess
				},
				typeName: ZodFirstPartyTypeKind.ZodEffects,
				...processCreateParams(params)
			});
		};
		var ZodOptional = class extends ZodType {
			_parse(input) {
				if (this._getType(input) === ZodParsedType.undefined) return OK(void 0);
				return this._def.innerType._parse(input);
			}
			unwrap() {
				return this._def.innerType;
			}
		};
		ZodOptional.create = (type, params) => {
			return new ZodOptional({
				innerType: type,
				typeName: ZodFirstPartyTypeKind.ZodOptional,
				...processCreateParams(params)
			});
		};
		var ZodNullable = class extends ZodType {
			_parse(input) {
				if (this._getType(input) === ZodParsedType.null) return OK(null);
				return this._def.innerType._parse(input);
			}
			unwrap() {
				return this._def.innerType;
			}
		};
		ZodNullable.create = (type, params) => {
			return new ZodNullable({
				innerType: type,
				typeName: ZodFirstPartyTypeKind.ZodNullable,
				...processCreateParams(params)
			});
		};
		var ZodDefault = class extends ZodType {
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				let data = ctx.data;
				if (ctx.parsedType === ZodParsedType.undefined) data = this._def.defaultValue();
				return this._def.innerType._parse({
					data,
					path: ctx.path,
					parent: ctx
				});
			}
			removeDefault() {
				return this._def.innerType;
			}
		};
		ZodDefault.create = (type, params) => {
			return new ZodDefault({
				innerType: type,
				typeName: ZodFirstPartyTypeKind.ZodDefault,
				defaultValue: typeof params.default === "function" ? params.default : () => params.default,
				...processCreateParams(params)
			});
		};
		var ZodCatch = class extends ZodType {
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				const newCtx = {
					...ctx,
					common: {
						...ctx.common,
						issues: []
					}
				};
				const result = this._def.innerType._parse({
					data: newCtx.data,
					path: newCtx.path,
					parent: { ...newCtx }
				});
				if (isAsync(result)) return result.then((result) => {
					return {
						status: "valid",
						value: result.status === "valid" ? result.value : this._def.catchValue({
							get error() {
								return new ZodError(newCtx.common.issues);
							},
							input: newCtx.data
						})
					};
				});
				else return {
					status: "valid",
					value: result.status === "valid" ? result.value : this._def.catchValue({
						get error() {
							return new ZodError(newCtx.common.issues);
						},
						input: newCtx.data
					})
				};
			}
			removeCatch() {
				return this._def.innerType;
			}
		};
		ZodCatch.create = (type, params) => {
			return new ZodCatch({
				innerType: type,
				typeName: ZodFirstPartyTypeKind.ZodCatch,
				catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
				...processCreateParams(params)
			});
		};
		var ZodNaN = class extends ZodType {
			_parse(input) {
				if (this._getType(input) !== ZodParsedType.nan) {
					const ctx = this._getOrReturnCtx(input);
					addIssueToContext(ctx, {
						code: ZodIssueCode.invalid_type,
						expected: ZodParsedType.nan,
						received: ctx.parsedType
					});
					return INVALID;
				}
				return {
					status: "valid",
					value: input.data
				};
			}
		};
		ZodNaN.create = (params) => {
			return new ZodNaN({
				typeName: ZodFirstPartyTypeKind.ZodNaN,
				...processCreateParams(params)
			});
		};
		var ZodBranded = class extends ZodType {
			_parse(input) {
				const { ctx } = this._processInputParams(input);
				const data = ctx.data;
				return this._def.type._parse({
					data,
					path: ctx.path,
					parent: ctx
				});
			}
			unwrap() {
				return this._def.type;
			}
		};
		var ZodPipeline = class ZodPipeline extends ZodType {
			_parse(input) {
				const { status, ctx } = this._processInputParams(input);
				if (ctx.common.async) {
					const handleAsync = async () => {
						const inResult = await this._def.in._parseAsync({
							data: ctx.data,
							path: ctx.path,
							parent: ctx
						});
						if (inResult.status === "aborted") return INVALID;
						if (inResult.status === "dirty") {
							status.dirty();
							return DIRTY(inResult.value);
						} else return this._def.out._parseAsync({
							data: inResult.value,
							path: ctx.path,
							parent: ctx
						});
					};
					return handleAsync();
				} else {
					const inResult = this._def.in._parseSync({
						data: ctx.data,
						path: ctx.path,
						parent: ctx
					});
					if (inResult.status === "aborted") return INVALID;
					if (inResult.status === "dirty") {
						status.dirty();
						return {
							status: "dirty",
							value: inResult.value
						};
					} else return this._def.out._parseSync({
						data: inResult.value,
						path: ctx.path,
						parent: ctx
					});
				}
			}
			static create(a, b) {
				return new ZodPipeline({
					in: a,
					out: b,
					typeName: ZodFirstPartyTypeKind.ZodPipeline
				});
			}
		};
		var ZodReadonly = class extends ZodType {
			_parse(input) {
				const result = this._def.innerType._parse(input);
				const freeze = (data) => {
					if (isValid(data)) data.value = Object.freeze(data.value);
					return data;
				};
				return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
			}
			unwrap() {
				return this._def.innerType;
			}
		};
		ZodReadonly.create = (type, params) => {
			return new ZodReadonly({
				innerType: type,
				typeName: ZodFirstPartyTypeKind.ZodReadonly,
				...processCreateParams(params)
			});
		};
		ZodObject.lazycreate;
		var ZodFirstPartyTypeKind;
		(function(ZodFirstPartyTypeKind) {
			ZodFirstPartyTypeKind["ZodString"] = "ZodString";
			ZodFirstPartyTypeKind["ZodNumber"] = "ZodNumber";
			ZodFirstPartyTypeKind["ZodNaN"] = "ZodNaN";
			ZodFirstPartyTypeKind["ZodBigInt"] = "ZodBigInt";
			ZodFirstPartyTypeKind["ZodBoolean"] = "ZodBoolean";
			ZodFirstPartyTypeKind["ZodDate"] = "ZodDate";
			ZodFirstPartyTypeKind["ZodSymbol"] = "ZodSymbol";
			ZodFirstPartyTypeKind["ZodUndefined"] = "ZodUndefined";
			ZodFirstPartyTypeKind["ZodNull"] = "ZodNull";
			ZodFirstPartyTypeKind["ZodAny"] = "ZodAny";
			ZodFirstPartyTypeKind["ZodUnknown"] = "ZodUnknown";
			ZodFirstPartyTypeKind["ZodNever"] = "ZodNever";
			ZodFirstPartyTypeKind["ZodVoid"] = "ZodVoid";
			ZodFirstPartyTypeKind["ZodArray"] = "ZodArray";
			ZodFirstPartyTypeKind["ZodObject"] = "ZodObject";
			ZodFirstPartyTypeKind["ZodUnion"] = "ZodUnion";
			ZodFirstPartyTypeKind["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
			ZodFirstPartyTypeKind["ZodIntersection"] = "ZodIntersection";
			ZodFirstPartyTypeKind["ZodTuple"] = "ZodTuple";
			ZodFirstPartyTypeKind["ZodRecord"] = "ZodRecord";
			ZodFirstPartyTypeKind["ZodMap"] = "ZodMap";
			ZodFirstPartyTypeKind["ZodSet"] = "ZodSet";
			ZodFirstPartyTypeKind["ZodFunction"] = "ZodFunction";
			ZodFirstPartyTypeKind["ZodLazy"] = "ZodLazy";
			ZodFirstPartyTypeKind["ZodLiteral"] = "ZodLiteral";
			ZodFirstPartyTypeKind["ZodEnum"] = "ZodEnum";
			ZodFirstPartyTypeKind["ZodEffects"] = "ZodEffects";
			ZodFirstPartyTypeKind["ZodNativeEnum"] = "ZodNativeEnum";
			ZodFirstPartyTypeKind["ZodOptional"] = "ZodOptional";
			ZodFirstPartyTypeKind["ZodNullable"] = "ZodNullable";
			ZodFirstPartyTypeKind["ZodDefault"] = "ZodDefault";
			ZodFirstPartyTypeKind["ZodCatch"] = "ZodCatch";
			ZodFirstPartyTypeKind["ZodPromise"] = "ZodPromise";
			ZodFirstPartyTypeKind["ZodBranded"] = "ZodBranded";
			ZodFirstPartyTypeKind["ZodPipeline"] = "ZodPipeline";
			ZodFirstPartyTypeKind["ZodReadonly"] = "ZodReadonly";
		})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
		const stringType = ZodString.create;
		const numberType = ZodNumber.create;
		const booleanType = ZodBoolean.create;
		ZodNaN.create;
		ZodBigInt.create;
		ZodBoolean.create;
		ZodDate.create;
		ZodSymbol.create;
		ZodUndefined.create;
		ZodNull.create;
		ZodAny.create;
		ZodUnknown.create;
		ZodNever.create;
		ZodVoid.create;
		const arrayType = ZodArray.create;
		const objectType = ZodObject.create;
		ZodObject.strictCreate;
		const unionType = ZodUnion.create;
		ZodDiscriminatedUnion.create;
		ZodIntersection.create;
		ZodTuple.create;
		ZodRecord.create;
		ZodMap.create;
		ZodSet.create;
		ZodFunction.create;
		ZodLazy.create;
		const literalType = ZodLiteral.create;
		const enumType = ZodEnum.create;
		ZodNativeEnum.create;
		ZodPromise.create;
		ZodEffects.create;
		ZodOptional.create;
		ZodNullable.create;
		ZodEffects.createWithPreprocess;
		ZodPipeline.create;
		//#endregion
		//#region lib/types/shared/rpc-contract.js
		/** Shared RPC DTOs and fail codes for `explorerFs`. */
		const EXPLORER_FS_SERVICE = "explorerFs";
		//#endregion
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
		//#region lib/types/client/state/tabs.js
		/**
		* Client-side tab roster for the file explorer editor.
		*
		* `getSnapshot` MUST return a stable reference between mutations — React's
		* useSyncExternalStore infinite-loops if every call allocates a new object.
		*/
		const EMPTY = {
			open: [],
			activePath: null
		};
		function titleOf(path) {
			if (path === "") return "/";
			const parts = path.split("/");
			return parts[parts.length - 1] || path;
		}
		/**
		* Mutable tab roster with subscribe semantics for React.
		*/
		var TabsStore = class {
			#open = [];
			#activePath = null;
			#snapshot = EMPTY;
			#listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			/** Open or activate a path. Returns whether a new tab was created. */
			open(path) {
				if (this.#open.find((t) => t.path === path) !== void 0) {
					if (this.#activePath === path) return false;
					this.#activePath = path;
					this.#emit();
					return false;
				}
				this.#open = [...this.#open, {
					path,
					title: titleOf(path)
				}];
				this.#activePath = path;
				this.#emit();
				return true;
			}
			activate(path) {
				if (!this.#open.some((t) => t.path === path)) return;
				if (this.#activePath === path) return;
				this.#activePath = path;
				this.#emit();
			}
			/**
			* Close a tab. Activates neighbor to the right, else left, else null.
			* @returns whether the tab was present.
			*/
			close(path) {
				const index = this.#open.findIndex((t) => t.path === path);
				if (index < 0) return false;
				const next = this.#open.filter((t) => t.path !== path);
				this.#open = next;
				if (this.#activePath === path) {
					const right = next[index];
					const left = next[index - 1];
					this.#activePath = right?.path ?? left?.path ?? null;
				}
				this.#emit();
				return true;
			}
			/** Rename an open tab path (after a successful host rename). */
			rename(from, to) {
				this.#open = this.#open.map((t) => t.path === from ? {
					path: to,
					title: titleOf(to)
				} : t);
				if (this.#activePath === from) this.#activePath = to;
				this.#emit();
			}
			#emit() {
				this.#snapshot = {
					open: this.#open,
					activePath: this.#activePath
				};
				for (const listener of this.#listeners) listener();
			}
		};
		//#endregion
		//#region lib/types/client/state/buffers.js
		/**
		* Per-path editor buffers and dirty tracking.
		*/
		/**
		* Text buffers keyed by relative path.
		*/
		var BuffersStore = class {
			#map = /* @__PURE__ */ new Map();
			#listeners = /* @__PURE__ */ new Set();
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			get(path) {
				return this.#map.get(path);
			}
			/**
			* Load or replace buffer from a successful read. Clears dirty and stale.
			* `mtimeMs` is the disk revision this content came from; it travels back
			* with the next save so the host can reject a clobbered write.
			*/
			load(path, content, mtimeMs) {
				this.#map.set(path, {
					path,
					content,
					savedContent: content,
					mtimeMs: typeof mtimeMs === "number" ? mtimeMs : null,
					stale: false
				});
				this.#emit();
			}
			/** Update draft content; dirty when content !== savedContent. */
			setContent(path, content) {
				const prev = this.#map.get(path);
				if (prev !== void 0 && prev.content === content) return;
				if (prev === void 0) this.#map.set(path, {
					path,
					content,
					savedContent: content,
					mtimeMs: null,
					stale: false
				});
				else this.#map.set(path, {
					...prev,
					content
				});
				this.#emit();
			}
			/** Mark current content as saved (after successful write). */
			markSaved(path, mtimeMs) {
				const prev = this.#map.get(path);
				if (prev === void 0) return;
				this.#map.set(path, {
					...prev,
					savedContent: prev.content,
					mtimeMs: typeof mtimeMs === "number" ? mtimeMs : prev.mtimeMs,
					stale: false
				});
				this.#emit();
			}
			/**
			* The file moved on disk while this buffer holds unsaved edits.
			*
			* The buffer is deliberately kept — the user's work is never discarded —
			* and the editor surfaces an explicit reload instead.
			*/
			markStale(path) {
				const prev = this.#map.get(path);
				if (prev === void 0 || prev.stale === true) return;
				this.#map.set(path, {
					...prev,
					stale: true
				});
				this.#emit();
			}
			isDirty(path) {
				const entry = this.#map.get(path);
				if (entry === void 0) return false;
				return entry.content !== entry.savedContent;
			}
			drop(path) {
				if (!this.#map.delete(path)) return;
				this.#emit();
			}
			/** Move buffer after rename. */
			rename(from, to) {
				const prev = this.#map.get(from);
				if (prev === void 0) return;
				this.#map.delete(from);
				this.#map.set(to, {
					...prev,
					path: to
				});
				this.#emit();
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		//#endregion
		//#region lib/types/client/state/md-mode.js
		/**
		* Per-path markdown preview vs source mode (in-memory only).
		*/
		function isMarkdownPath(path) {
			const lower = path.toLowerCase();
			return lower.endsWith(".md") || lower.endsWith(".markdown");
		}
		/**
		* Remember preview/source preference per path for the session.
		*/
		var MdModeStore = class {
			#modes = /* @__PURE__ */ new Map();
			#listeners = /* @__PURE__ */ new Set();
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			get(path) {
				return this.#modes.get(path) ?? "source";
			}
			set(path, mode) {
				this.#modes.set(path, mode);
				this.#emit();
			}
			toggle(path) {
				const next = this.get(path) === "preview" ? "source" : "preview";
				this.set(path, next);
				return next;
			}
			rename(from, to) {
				const mode = this.#modes.get(from);
				if (mode === void 0) return;
				this.#modes.delete(from);
				this.#modes.set(to, mode);
				this.#emit();
			}
			drop(path) {
				if (!this.#modes.delete(path)) return;
				this.#emit();
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		//#endregion
		//#region lib/types/client/state/mode.js
		/**
		* In-memory explorer mode flag (sidebar occupancy).
		* Subscribe API matches useSyncExternalStore (`() => void` listeners).
		*/
		var ExplorerModeStore = class {
			enabled = false;
			listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.enabled;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			setEnabled(next) {
				if (this.enabled === next) return;
				this.enabled = next;
				for (const listener of this.listeners) listener();
			}
			toggle() {
				this.setEnabled(!this.enabled);
				return this.enabled;
			}
		};
		//#endregion
		//#region lib/types/client/locales.js
		/** Locales for the file explorer plugin. */
		const NS = "file-explorer";
		const zh = {
			viewLabel: "文件",
			viewChatLabel: "对话",
			wsOpenOther: "打开其他目录…",
			wsWorkspaces: "工作区",
			wsLoading: "正在读取工作区…",
			wsPrompt: "输入要打开的目录（绝对路径）",
			subagentTitle: "子智能体",
			subagentNew: "新建子智能体",
			subagentDelete: "删除当前子智能体",
			subagentDeleteConfirm: "删除这个子智能体及其记忆文件？此操作不可撤销。",
			subagentRefresh: "重新读取",
			subagentResize: "拖动调整高度",
			subagentEmpty: "还没有子智能体。点 ＋ 新建一个，它会把记忆写进这个工作区的 .dsh/subagents/ 里。",
			subagentPick: "从上方标签里选一个子智能体。",
			subagentFromMain: "来自主智能体",
			subagentYou: "我",
			subagentThinking: "子智能体正在思考…",
			subagentSend: "发送",
			subagentSending: "发送中…",
			subagentPlaceholder: "给子智能体发消息…（Ctrl+Enter 发送，Enter 换行）",
			subagentNoModel: "跟随会话模型",
			subagentMemoryHint: "记忆文件：.dsh/subagents/　主智能体可直接读取以了解它的进展",
			emptyWorkspace: "工作区为空",
			settingsTitle: "SupaNexus 文件浏览",
			settingsDescription: "工作区根目录与对话内文件链接打开方式",
			settingsRoot: "兜底根目录",
			settingsRootHint: "会话未钉定 cwd 时使用；会话打开文件浏览时会优先钉到会话工作区",
			settingsOpenLinks: "在编辑器中打开对话内文件链接",
			settingsOpenLinksHint: "拦截会话消息里的本地路径链接，并在文件编辑器中打开",
			expand: "展开",
			collapse: "折叠",
			expandAll: "全部展开",
			collapseAll: "全部折叠",
			readOnly: "当前不可写入设置",
			newFile: "新建文件",
			newFolder: "新建文件夹",
			refresh: "刷新",
			rename: "重命名",
			delete: "删除",
			promptNewFile: "新文件名",
			promptNewFolder: "新文件夹名",
			promptRename: "重命名为",
			confirmDelete: "确定删除「{name}」？",
			openInFileManager: "在文件管理器中打开",
			revealPathInFileManager: "打开文件所在目录",
			tabClose: "关闭",
			tabCloseRight: "关闭右侧",
			tabCloseAll: "关闭所有",
			confirmCloseDirty: "有未保存的更改，确定关闭？",
			editorEmpty: "从左侧目录树打开文件",
			editorSave: "保存",
			editorFormat: "格式化",
			editorFormatted: "已格式化",
			editorFormatUnavailable: "该语言没有内置格式化器",
			editorSource: "源码",
			editorPreview: "预览",
			editorSaved: "已保存",
			editorConflict: "磁盘上已有更新的版本，已阻止保存以免覆盖",
			editorStaleBanner: "此文件已被磁盘上的更新覆盖（可能来自对话中的修改），当前编辑内容仍保留",
			errIsBinary: "二进制文件无法在编辑器中打开（如 .pyc、图片、压缩包等）",
			errTooLarge: "文件过大，编辑器最多支持 8 MiB",
			errNotFound: "文件不存在（可能已被移动或删除）",
			errOutOfRoot: "路径越出了工作区根目录，已拒绝访问",
			errUpstreamBusy: "上游模型限流（HTTP 429），排队中 —— 稍后重试即可",
			editorReload: "加载磁盘版本",
			editorForceSave: "强制保存（覆盖磁盘）",
			editorTextareaMode: "文本框模式",
			treeAriaLabel: "工作区文件",
			sessionFolderBadge: "会话",
			sessionFolderUnnamed: "未命名会话",
			sessionFolderSelf: "会话文件夹",
			sessionFolderWorkspace: "工作区",
			sessionFilesProduced: "产出",
			sessionFilesTotal: "相关",
			quickOpenPlaceholder: "输入文件名快速打开（↑↓ 选择，Enter 打开，Esc 关闭）",
			quickOpenLoading: "正在建立文件索引…",
			quickOpenNoMatch: "没有匹配的文件",
			quickOpenCount: "{n} / {total} 个文件",
			quickOpenError: "无法读取文件索引",
			editorMinimap: "小地图（缩略图）",
			editorAppearance: "主题",
			editorTheme: "底色",
			editorThemeDark: "深色",
			editorThemeLight: "浅色",
			editorThemeHighContrast: "高对比",
			editorThemeVscode: "VSCode 主题",
			editorFontSize: "字号",
			editorFontSmaller: "缩小字号",
			editorFontLarger: "放大字号",
			editorCustomColor: "自定义色值",
			editorCustomColorHint: "支持 #RGB / #RRGGBB / #RRGGBBAA",
			editorCustomColorInvalid: "色值无效，请使用 HTML 十六进制颜色",
			editorCustomColorClear: "清除",
			editorScheme: "方案",
			editorSchemeSave: "保存当前方案",
			editorSchemeEmpty: "暂无已保存方案",
			editorSchemeRemove: "删除方案",
			editorFilePath: "文件路径"
		};
		const en = {
			viewLabel: "Files",
			viewChatLabel: "Chat",
			wsOpenOther: "Open another folder…",
			wsWorkspaces: "Workspaces",
			wsLoading: "Reading workspaces…",
			wsPrompt: "Folder to open (absolute path)",
			subagentTitle: "Subagent",
			subagentNew: "New subagent",
			subagentDelete: "Delete the current subagent",
			subagentDeleteConfirm: "Delete this subagent and its memory file? This cannot be undone.",
			subagentRefresh: "Reload",
			subagentResize: "Drag to resize",
			subagentEmpty: "No subagent yet. Press ＋ to create one — it keeps its memory in this workspace under .dsh/subagents/.",
			subagentPick: "Pick a subagent from the tabs above.",
			subagentFromMain: "From the main agent",
			subagentYou: "You",
			subagentThinking: "Subagent is thinking…",
			subagentSend: "Send",
			subagentSending: "Sending…",
			subagentPlaceholder: "Message the subagent… (Ctrl+Enter to send, Enter for a newline)",
			subagentNoModel: "follows the session model",
			subagentMemoryHint: "Memory file: .dsh/subagents/ — the main agent reads it directly to follow along",
			emptyWorkspace: "Empty workspace",
			settingsTitle: "SupaNexus file explorer",
			settingsDescription: "Workspace root and conversation file-link behavior",
			settingsRoot: "Fallback root",
			settingsRootHint: "Used before a session cwd pin; opening the explorer pins to the session workspace when available",
			settingsOpenLinks: "Open conversation file links in editor",
			settingsOpenLinksHint: "Intercept local path links in conversation messages and open them in the file editor",
			expand: "Expand",
			collapse: "Collapse",
			expandAll: "Expand All",
			collapseAll: "Collapse All",
			readOnly: "Settings are read-only right now",
			newFile: "New file",
			newFolder: "New folder",
			refresh: "Refresh",
			rename: "Rename",
			delete: "Delete",
			promptNewFile: "New file name",
			promptNewFolder: "New folder name",
			promptRename: "Rename to",
			confirmDelete: "Delete \"{name}\"?",
			openInFileManager: "Reveal in file manager",
			revealPathInFileManager: "Reveal in File Manager",
			tabClose: "Close",
			tabCloseRight: "Close to the Right",
			tabCloseAll: "Close All",
			confirmCloseDirty: "Unsaved changes will be discarded. Close anyway?",
			editorEmpty: "Open a file from the explorer",
			editorSave: "Save",
			editorFormat: "Format",
			editorFormatted: "Formatted",
			editorFormatUnavailable: "No built-in formatter for this language",
			editorSource: "Source",
			editorPreview: "Preview",
			editorSaved: "Saved",
			editorConflict: "A newer revision exists on disk — save blocked to avoid overwriting it",
			editorStaleBanner: "This file was changed on disk (possibly by the conversation). Your edits are kept.",
			errIsBinary: "Binary files can't be opened in the editor (.pyc, images, archives, …)",
			errTooLarge: "File too large — the editor supports up to 8 MiB",
			errNotFound: "File not found (it may have been moved or deleted)",
			errOutOfRoot: "Path escapes the workspace root — access denied",
			errUpstreamBusy: "Upstream model is throttling (HTTP 429), queued — just retry in a moment",
			editorReload: "Load disk version",
			editorForceSave: "Force save (overwrite)",
			editorTextareaMode: "Textarea mode",
			treeAriaLabel: "Workspace files",
			sessionFolderBadge: "Session",
			sessionFolderUnnamed: "Untitled session",
			sessionFolderSelf: "Session folder",
			sessionFolderWorkspace: "Workspace",
			sessionFilesProduced: "Produced",
			sessionFilesTotal: "Related",
			quickOpenPlaceholder: "Type a file name to open (↑↓ select, Enter open, Esc close)",
			quickOpenLoading: "Building the file index…",
			quickOpenNoMatch: "No matching files",
			quickOpenCount: "{n} / {total} files",
			quickOpenError: "Cannot read the file index",
			editorMinimap: "Minimap",
			editorAppearance: "Theme",
			editorTheme: "Background",
			editorThemeDark: "Dark",
			editorThemeLight: "Light",
			editorThemeHighContrast: "High contrast",
			editorThemeVscode: "VSCode theme",
			editorFontSize: "Font size",
			editorFontSmaller: "Decrease font size",
			editorFontLarger: "Increase font size",
			editorCustomColor: "Custom color",
			editorCustomColorHint: "Accepts #RGB / #RRGGBB / #RRGGBBAA",
			editorCustomColorInvalid: "Invalid color — use an HTML hex value",
			editorCustomColorClear: "Clear",
			editorScheme: "Schemes",
			editorSchemeSave: "Save current scheme",
			editorSchemeEmpty: "No saved schemes yet",
			editorSchemeRemove: "Remove scheme",
			editorFilePath: "File path"
		};
		const dictionaries = {
			zh,
			en
		};
		function explorerT(locale) {
			const table = locale.startsWith("zh") ? zh : en;
			return (key, vars) => {
				let text = table[key];
				if (vars !== void 0) for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, value);
				return text;
			};
		}
		/**
		 * Map a host RPC failure to localized copy. The host's `message` is English
		 * engineering prose — stable UX comes from translating the stable `code`.
		 * Unknown codes fall back to the host message (it may carry useful IO detail).
		 */
		const RPC_ERROR_KEYS = {
			IS_BINARY: "errIsBinary",
			TOO_LARGE: "errTooLarge",
			NOT_FOUND: "errNotFound",
			OUT_OF_ROOT: "errOutOfRoot",
			CONFLICT: "editorConflict"
		};
		/** Longest raw host message worth showing in a one-line error banner. */
		const ERROR_TEXT_MAX = 240;
		/**
		 * Fold a raw host message into something a banner can hold.
		 *
		 * Model-layer failures arrive as the provider's own JSON, sometimes several
		 * hundred characters of nested escapes. A queued/throttled upstream is by far
		 * the most common of those and is worth naming plainly; anything else long
		 * gets clipped so the banner stays readable instead of wrapping the panel.
		 */
		function summarizeError(message, t) {
			const text = typeof message === "string" ? message : String(message);
			if (typeof t === "function" && /\b429\b/.test(text) && /throttl|rate.?limit|soft_rate|isQueued/i.test(text)) return t("errUpstreamBusy");
			return text.length <= ERROR_TEXT_MAX ? text : `${text.slice(0, ERROR_TEXT_MAX)}…`;
		}
		function describeRpcError(error, t) {
			const key = error && RPC_ERROR_KEYS[error.code];
			return key ? t(key) : summarizeError((error && error.message) || String(error), t);
		}
		//#endregion
		//#region lib/types/client/use-explorer-t.js
		/** Subscribe to active locale and return an explorer translate function. */
		/** Reactive `t` for file-explorer copy. */
		function useExplorerT(ctx) {
			return explorerT((0, react.useSyncExternalStore)((listener) => ctx.locale.subscribe(listener), () => ctx.locale.getSnapshot().active));
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/ui/dsh-plugin-file-explorer/src/client/explorer/explorer.module.css.mjs
		const css$3 = ".t3VzRa_panel{background:var(--dsw-alias-bg-layer-2);min-width:0;height:100%;min-height:0;color:var(--dsw-alias-label-primary);flex-direction:column;font-size:13px;display:flex;overflow:hidden}.t3VzRa_toolbar{border-bottom:1px solid var(--dsw-alias-border-l2);box-sizing:border-box;flex-shrink:0;justify-content:space-between;align-items:center;gap:8px;min-height:36px;padding:8px 10px;display:flex}.t3VzRa_workspaceName{text-overflow:ellipsis;white-space:nowrap;min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:600;overflow:hidden}.t3VzRa_toolbarActions{flex-shrink:0;align-items:center;gap:2px;display:flex}.t3VzRa_iconBtn{appearance:none;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:0;border-radius:4px;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}.t3VzRa_iconBtn:hover{background:var(--dsw-alias-bg-layer-3)}.t3VzRa_iconBtn:disabled{opacity:.45;cursor:default}.t3VzRa_toolIcon{width:16px;height:16px;display:block}.t3VzRa_toolBtn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:inherit;font:inherit;cursor:pointer;border-radius:6px;padding:4px 8px}.t3VzRa_toolBtn:hover{border-color:var(--dsw-alias-label-dimmed)}.t3VzRa_toolBtn:disabled{opacity:.45;cursor:default}.t3VzRa_errorBanner{color:var(--dsw-alias-danger,#c44);background:var(--dsw-alias-bg-layer-3);border-bottom:1px solid var(--dsw-alias-border-l2);flex-shrink:0;padding:6px 10px}.t3VzRa_treeScroll{overscroll-behavior:contain;scrollbar-gutter:stable both-edges;flex:1;min-width:0;min-height:0;overflow:auto}.t3VzRa_treeScroll::-webkit-scrollbar{width:8px;height:8px}.t3VzRa_treeScroll::-webkit-scrollbar-thumb{background:var(--dsw-alias-scrollbar-bg-l2,color-mix(in srgb, var(--dsw-alias-label-primary) 28%, transparent));border-radius:4px}.t3VzRa_treeScroll::-webkit-scrollbar-thumb:hover{background:var(--dsw-alias-scrollbar-hover-l2,color-mix(in srgb, var(--dsw-alias-label-primary) 42%, transparent))}.t3VzRa_treeScroll::-webkit-scrollbar-corner{background:0 0}.t3VzRa_tree{vertical-align:top;box-sizing:border-box;cursor:pointer;min-width:100%;margin:0;padding:4px 0 12px;list-style:none;display:inline-block}.t3VzRa_tree>li,.t3VzRa_children>li{display:block}.t3VzRa_empty{color:var(--dsw-alias-label-secondary);cursor:default;padding:16px 12px}.t3VzRa_row{box-sizing:border-box;width:max-content;max-width:none;color:inherit;font:inherit;text-align:left;cursor:pointer;user-select:none;background:0 0;border:0;border-radius:4px;outline:none;align-items:center;gap:4px;padding-top:3px;padding-bottom:3px;padding-right:12px;display:flex;position:relative}.t3VzRa_row:hover{background:var(--dsw-alias-bg-layer-3)}.t3VzRa_row:focus,.t3VzRa_row:focus-visible{cursor:pointer;background:var(--dsw-alias-bg-layer-3);box-shadow:inset 0 0 0 1px var(--dsw-alias-border-l1,var(--dsw-alias-label-dimmed))}.t3VzRa_rowSelected{background:color-mix(in srgb, var(--dsw-alias-label-primary) 10%, var(--dsw-alias-bg-layer-3))}.t3VzRa_rowSelected:focus,.t3VzRa_rowSelected:focus-visible{background:color-mix(in srgb, var(--dsw-alias-label-primary) 14%, var(--dsw-alias-bg-layer-3))}.t3VzRa_rowSelected:before{content:\"\";background:var(--dsw-alias-label-primary);border-radius:1px;width:2px;position:absolute;top:2px;bottom:2px;left:0}.t3VzRa_rowOpened:not(.t3VzRa_rowSelected){color:var(--dsw-alias-label-primary);font-weight:500}.t3VzRa_rowEditing{cursor:default;background:var(--dsw-alias-bg-layer-3)}.t3VzRa_chevron{opacity:.7;flex-shrink:0;width:14px;height:14px;display:block}.t3VzRa_chevronBtn{appearance:none;color:inherit;cursor:pointer;background:0 0;border:0;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;width:18px;height:18px;margin:0;padding:0;display:inline-flex}.t3VzRa_chevronBtn:hover{background:var(--dsw-alias-bg-layer-1)}.t3VzRa_chevronPlaceholder{flex-shrink:0;width:18px;height:18px}.t3VzRa_icon{opacity:.85;flex-shrink:0;width:14px;height:14px}.t3VzRa_label{white-space:nowrap;flex:none}.t3VzRa_inlineInput{border:1px solid var(--dsw-alias-border-l1,var(--dsw-alias-border-l2));background:var(--dsw-alias-bg-layer-1);width:12em;min-width:120px;height:22px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:4px;outline:none;flex:0 auto;margin:0;padding:1px 6px}.t3VzRa_inlineInput:focus{border-color:var(--dsw-alias-label-dimmed)}.t3VzRa_children{margin:0;padding:0;list-style:none}.t3VzRa_emptyChild{color:var(--dsw-alias-label-secondary);padding-top:2px;padding-bottom:2px;padding-right:8px;font-size:12px;list-style:none}.t3VzRa_contextMenu{z-index:1000;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:148px;box-shadow:0 8px 24px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);border-radius:8px;flex-direction:column;gap:2px;margin:0;padding:4px;display:flex;position:fixed}.t3VzRa_contextItem{appearance:none;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:6px;padding:7px 10px;font-size:13px}.t3VzRa_contextItem:hover{background:var(--dsw-alias-bg-layer-3)}.t3VzRa_contextItem:disabled{opacity:.45;cursor:default}.t3VzRa_contextItem:disabled:hover{background:0 0}.t3VzRa_contextItemDanger{color:var(--dsw-alias-danger,#c44)}.t3VzRa_contextItemDanger:hover{background:color-mix(in srgb, var(--dsw-alias-danger,#c44) 12%, var(--dsw-alias-bg-layer-3))}";
		const tagId$3 = "dsh-vscode/explorer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-vscode";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var explorer_module_css_default = {
			"chevron": "t3VzRa_chevron",
			"chevronBtn": "t3VzRa_chevronBtn",
			"chevronPlaceholder": "t3VzRa_chevronPlaceholder",
			"children": "t3VzRa_children",
			"contextItem": "t3VzRa_contextItem",
			"contextItemDanger": "t3VzRa_contextItemDanger",
			"contextMenu": "t3VzRa_contextMenu",
			"empty": "t3VzRa_empty",
			"emptyChild": "t3VzRa_emptyChild",
			"errorBanner": "t3VzRa_errorBanner",
			"icon": "t3VzRa_icon",
			"iconBtn": "t3VzRa_iconBtn",
			"inlineInput": "t3VzRa_inlineInput",
			"label": "t3VzRa_label",
			"panel": "t3VzRa_panel",
			"row": "t3VzRa_row",
			"rowEditing": "t3VzRa_rowEditing",
			"rowOpened": "t3VzRa_rowOpened",
			"rowSelected": "t3VzRa_rowSelected",
			"toolBtn": "t3VzRa_toolBtn",
			"toolIcon": "t3VzRa_toolIcon",
			"toolbar": "t3VzRa_toolbar",
			"toolbarActions": "t3VzRa_toolbarActions",
			"tree": "t3VzRa_tree",
			"treeScroll": "t3VzRa_treeScroll",
			"workspaceName": "t3VzRa_workspaceName"
		};
		//#endregion
		//#region lib/types/client/explorer/InlineNameInput.js
		/**
		* Shared basename sanitizer and inline name editor for the file tree.
		*/
		/** Reject empty / path-segment / traversal names; strip parent path if pasted. */
		function sanitizeBasename(raw) {
			const trimmed = raw.trim();
			if (trimmed === "") return null;
			const base = trimmed.replaceAll("\\", "/").split("/").filter(Boolean).pop() ?? "";
			if (base === "" || base === "." || base === "..") return null;
			if (base.includes("/") || base.includes("\\")) return null;
			return base;
		}
		function FolderIcon$1() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.icon,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: "M1.5 3.5h5l1 1.5h7v8h-13z",
					opacity: "0.85"
				})
			});
		}
		function FileIcon$1() {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.icon,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: "M4 1.5h5.5L13 5v9.5H4z",
					opacity: "0.75"
				})
			});
		}
		/**
		* Tree row with a focused text field. Enter commits; Escape cancels;
		* blur commits when non-empty, otherwise cancels.
		*/
		function InlineNameInput(props) {
			const { depth, kind, initialValue, placeholder, ariaLabel, onCommit, onCancel } = props;
			const ref = (0, react.useRef)(null);
			const finished = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				const el = ref.current;
				if (el === null) return;
				el.focus();
				el.select();
			}, []);
			const finish = (fn) => {
				if (finished.current) return;
				finished.current = true;
				fn();
			};
			const tryCommit = (raw) => {
				const name = sanitizeBasename(raw);
				if (name === null) {
					finish(onCancel);
					return;
				}
				finish(() => onCommit(name));
			};
			const onKeyDown = (event) => {
				if (event.key === "Enter") {
					event.preventDefault();
					event.stopPropagation();
					tryCommit(event.currentTarget.value);
					return;
				}
				if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					finish(onCancel);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: `${explorer_module_css_default.row} ${explorer_module_css_default.rowEditing}`,
				style: { paddingLeft: 8 + depth * 12 },
				"data-file-explorer-inline-edit": "",
				children: [
					(0, react_jsx_runtime.jsx)("span", { className: explorer_module_css_default.chevronPlaceholder }),
					kind === "dir" ? (0, react_jsx_runtime.jsx)(FolderIcon$1, {}) : (0, react_jsx_runtime.jsx)(FileIcon$1, {}),
					(0, react_jsx_runtime.jsx)("input", {
						ref,
						className: explorer_module_css_default.inlineInput,
						defaultValue: initialValue,
						placeholder,
						"aria-label": ariaLabel,
						spellCheck: false,
						onClick: (event) => event.stopPropagation(),
						onKeyDown,
						onBlur: (event) => {
							tryCommit(event.currentTarget.value);
						}
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/explorer/ToolbarIcons.js
		function IconShell(props) {
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: explorer_module_css_default.iconBtn,
				title: props.title,
				"aria-label": props.title,
				onClick: props.onClick,
				children: props.children
			});
		}
		const svgProps = {
			className: explorer_module_css_default.toolIcon,
			viewBox: "0 0 16 16",
			fill: "none",
			"aria-hidden": true
		};
		/** Document with corner plus — new file. */
		function NewFileIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					...svgProps,
					children: [
						(0, react_jsx_runtime.jsx)("path", {
							d: "M4 2.5h5.2L12 5.3V13.5H4V2.5Z",
							stroke: "currentColor",
							strokeWidth: "1.2"
						}),
						(0, react_jsx_runtime.jsx)("path", {
							d: "M9 2.5V5.5H12",
							stroke: "currentColor",
							strokeWidth: "1.2"
						}),
						(0, react_jsx_runtime.jsx)("path", {
							d: "M8 8v4M6 10h4",
							stroke: "currentColor",
							strokeWidth: "1.2",
							strokeLinecap: "round"
						})
					]
				})
			});
		}
		/** Folder with plus — new folder. */
		function NewFolderIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					...svgProps,
					children: [(0, react_jsx_runtime.jsx)("path", {
						d: "M2 4.2h4.2l1.1 1.3H14v6.8H2V4.2Z",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinejoin: "round"
					}), (0, react_jsx_runtime.jsx)("path", {
						d: "M9.5 7.8v3.2M7.9 9.4h3.2",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round"
					})]
				})
			});
		}
		/** Circular arrows — refresh. */
		function RefreshIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					...svgProps,
					children: [(0, react_jsx_runtime.jsx)("path", {
						d: "M13 8a5 5 0 1 1-1.4-3.4",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round"
					}), (0, react_jsx_runtime.jsx)("path", {
						d: "M13 3.2V6.5H9.7",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})]
				})
			});
		}
		/** Nested chevrons — expand all. */
		function ExpandAllIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					...svgProps,
					children: [(0, react_jsx_runtime.jsx)("path", {
						d: "M3 4.5 8 9l5-4.5",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}), (0, react_jsx_runtime.jsx)("path", {
						d: "M3 8.5 8 13l5-4.5",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})]
				})
			});
		}
		/** Nested chevrons up — collapse all. */
		function CollapseAllIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsxs)("svg", {
					...svgProps,
					children: [(0, react_jsx_runtime.jsx)("path", {
						d: "M3 7.5 8 3l5 4.5",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}), (0, react_jsx_runtime.jsx)("path", {
						d: "M3 11.5 8 7l5 4.5",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})]
				})
			});
		}
		/** Plain folder — reveal in OS file manager. */
		function RevealIconButton(props) {
			return (0, react_jsx_runtime.jsx)(IconShell, {
				title: props.title,
				onClick: props.onClick,
				children: (0, react_jsx_runtime.jsx)("svg", {
					...svgProps,
					children: (0, react_jsx_runtime.jsx)("path", {
						d: "M2 4.2h4.2l1.1 1.3H14v6.8H2V4.2Z",
						stroke: "currentColor",
						strokeWidth: "1.2",
						strokeLinejoin: "round"
					})
				})
			});
		}
		//#endregion
		//#region lib/types/client/explorer/ExplorerContextMenu.js
		/**
		* Floating context menu for explorer rows (rename / delete).
		*/
		/**
		* Fixed-position menu; closes on outside click, Escape, or item select.
		*/
		function ExplorerContextMenu(props) {
			const { x, y, items, onClose } = props;
			const rootRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const onPointer = (event) => {
					const root = rootRef.current;
					if (root !== null && root.contains(event.target)) return;
					onClose();
				};
				const onKey = (event) => {
					if (event.key === "Escape") onClose();
				};
				const timer = window.setTimeout(() => {
					document.addEventListener("mousedown", onPointer, true);
					document.addEventListener("keydown", onKey, true);
				}, 0);
				return () => {
					window.clearTimeout(timer);
					document.removeEventListener("mousedown", onPointer, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, [onClose]);
			const maxX = typeof window !== "undefined" ? window.innerWidth - 8 : x;
			const maxY = typeof window !== "undefined" ? window.innerHeight - 8 : y;
			const left = Math.min(x, maxX - 160);
			const top = Math.min(y, maxY - 88);
			return (0, react_jsx_runtime.jsx)("div", {
				ref: rootRef,
				className: explorer_module_css_default.contextMenu,
				style: {
					left,
					top
				},
				role: "menu",
				"data-file-explorer-context-menu": "",
				children: items.map((item) => (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "menuitem",
					disabled: item.disabled === true,
					className: item.danger === true ? `${explorer_module_css_default.contextItem} ${explorer_module_css_default.contextItemDanger}` : explorer_module_css_default.contextItem,
					onClick: () => {
						if (item.disabled === true) return;
						onClose();
						item.onSelect();
					},
					children: item.label
				}, item.id))
			});
		}
		//#endregion
		//#region lib/types/client/explorer/scroll-tree-row.js
		/**
		* Scroll a tree row into the explorer's dedicated scrollport (not the page).
		* Native scrollIntoView often fails here because ancestors use overflow:hidden.
		*/
		const SCROLL_PAD = 12;
		function scrollTreeRowIntoView(row) {
			const scroller = row.closest("[data-file-explorer-tree-scroll]");
			if (!(scroller instanceof HTMLElement)) return;
			const rowRect = row.getBoundingClientRect();
			const box = scroller.getBoundingClientRect();
			let nextLeft = scroller.scrollLeft;
			let nextTop = scroller.scrollTop;
			// A long filename cannot fit horizontally. Keep its icon and indentation
			// visible instead of scrolling all the way to the filename's right edge.
			if (rowRect.width > box.width - SCROLL_PAD * 2) {
				if (rowRect.left < box.left + SCROLL_PAD || rowRect.left > box.right - SCROLL_PAD) nextLeft += rowRect.left - box.left - SCROLL_PAD;
			} else if (rowRect.right > box.right - SCROLL_PAD) nextLeft += rowRect.right - box.right + SCROLL_PAD;
			else if (rowRect.left < box.left + SCROLL_PAD) nextLeft -= box.left + SCROLL_PAD - rowRect.left;
			if (rowRect.bottom > box.bottom - SCROLL_PAD) nextTop += rowRect.bottom - box.bottom + SCROLL_PAD;
			else if (rowRect.top < box.top + SCROLL_PAD) nextTop -= box.top + SCROLL_PAD - rowRect.top;
			if (nextLeft !== scroller.scrollLeft || nextTop !== scroller.scrollTop) scroller.scrollTo({
				left: Math.max(0, nextLeft),
				top: Math.max(0, nextTop)
			});
		}
		//#endregion
		//#region lib/types/client/explorer/TreeNode.js
		/**
		* Single tree node with lazy children; rename/create via inline edit + context menu.
		*/
		function FolderIcon({ open = false }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.icon,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
						d: open ? "M1.5 5h13l-1.4 8h-12zM2 3h4.5l1 1.5H14V6H2z" : "M1.5 3.5h5l1 1.5h7v8h-13z",
					opacity: "0.85"
				})
			});
		}
		function fileIconKind(name) {
			const lower = name.toLowerCase();
			if (lower === "package.json" || lower.endsWith(".json")) return "json";
			if (lower.endsWith(".tsx") || lower.endsWith(".ts")) return "ts";
			if (lower.endsWith(".jsx") || lower.endsWith(".mjs") || lower.endsWith(".js")) return "js";
			if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "md";
			if (lower.endsWith(".css") || lower.endsWith(".scss")) return "css";
			if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
			if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
			if (lower.endsWith(".py")) return "py";
			if (lower.endsWith(".go")) return "go";
			if (lower.endsWith(".rs")) return "rs";
			if (lower.endsWith(".sh") || lower.endsWith(".ps1")) return "shell";
			return "file";
		}
		function FileIcon({ name }) {
			const kind = fileIconKind(name);
			const glyph = { ts: "TS", js: "JS", json: "{}", md: "M", css: "#", html: "<>", yaml: "Y", py: "Py", go: "Go", rs: "Rs", shell: ">_", file: "·" }[kind];
			return (0, react_jsx_runtime.jsx)("span", {
				className: "vscodeFileIcon",
				"data-file-kind": kind,
				"aria-hidden": "true",
				children: glyph
			});
		}
		function Chevron({ open }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				className: explorer_module_css_default.chevron,
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				style: {
					transform: open ? "rotate(90deg)" : void 0,
					transition: "transform 0.12s"
				},
				children: (0, react_jsx_runtime.jsx)("path", {
					fill: "currentColor",
					d: "M6 3l5 5-5 5z"
				})
			});
		}
		function joinPath(parent, name) {
			return parent === "" ? name : `${parent}/${name}`;
		}
		function parentPath(path) {
			return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
		}
		/**
		* Render one filesystem entry; directories expand lazily via `api.list`.
		*/
		function TreeNode(props) {
			const { entry, depth, api, t, activePath, selectedPath, onSelect, onOpenFile, onError, onTreeMutated, refreshToken, expandSignal, collapseSignal, external } = props;
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [children, setChildren] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [menu, setMenu] = (0, react.useState)(null);
			const [renaming, setRenaming] = (0, react.useState)(false);
			const [childDraft, setChildDraft] = (0, react.useState)(null);
			const loadChildren = (0, react.useCallback)(async () => {
				setLoading(true);
				const result = await api.list(entry.path);
				setLoading(false);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				setChildren(result.value.entries);
			}, [
				api,
				entry.path,
				onError
			]);
			(0, react.useEffect)(() => {
				if (!expanded) return;
				loadChildren();
			}, [
				expanded,
				refreshToken,
				loadChildren
			]);
			/**
			* Re-list this directory only when the host reported a change inside it.
			* `external` is a fresh object per batch, so this fires at most once per
			* poll for each affected directory instead of re-listing the whole tree.
			*/
			(0, react.useEffect)(() => {
				if (external === null || !expanded) return;
				if (!external.dirs.has(entry.path)) return;
				loadChildren();
			}, [
				external,
				expanded,
				entry.path,
				loadChildren
			]);
			(0, react.useEffect)(() => {
				if (expandSignal === 0 || entry.kind !== "dir") return;
				setExpanded(true);
			}, [expandSignal, entry.kind]);
			(0, react.useEffect)(() => {
				if (collapseSignal === 0 || entry.kind !== "dir") return;
				setExpanded(false);
			}, [collapseSignal, entry.kind]);
			(0, react.useEffect)(() => {
				if (entry.kind === "dir" && activePath?.startsWith(`${entry.path}/`)) setExpanded(true);
			}, [activePath, entry.kind, entry.path]);
			const toggleExpand = () => {
				if (entry.kind !== "dir") return;
				setExpanded((v) => !v);
			};
			const onRowClick = () => {
				if (renaming) return;
				onSelect(entry.path);
				if (entry.kind === "dir") {
					toggleExpand();
					return;
				}
				onOpenFile(entry.path);
			};
			const commitRename = async (name) => {
				setRenaming(false);
				if (name === entry.name) return;
				const to = joinPath(parentPath(entry.path), name);
				const result = await api.rename(entry.path, to);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onSelect(to);
				onTreeMutated();
			};
			const commitChildCreate = async (kind, name) => {
				setChildDraft(null);
				const path = joinPath(entry.path, name);
				if (kind === "file") {
					// -1 = "no expected revision": this file did not exist before.
					const result = await api.write(path, "", -1);
					if (!result.ok) {
						onError(result.error.message);
						return;
					}
					onTreeMutated();
					onSelect(path);
					onOpenFile(path);
					return;
				}
				const result = await api.mkdir(path);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onSelect(path);
				onTreeMutated();
			};
			const startChildDraft = (kind) => {
				setExpanded(true);
				setChildDraft(kind);
			};
			const remove = async () => {
				if (!window.confirm(t("confirmDelete", { name: entry.name }))) return;
				const result = await api.unlink(entry.path);
				if (!result.ok) {
					onError(result.error.message);
					return;
				}
				onTreeMutated();
			};
			const revealInFileManager = async () => {
				const result = await api.revealPath(entry.path);
				if (!result.ok) onError(result.error.message);
			};
			const selected = entry.path === selectedPath;
			const opened = entry.path === activePath;
			const rowRef = (0, react.useRef)(null);
			const rowClass = [
				explorer_module_css_default.row,
				selected ? explorer_module_css_default.rowSelected : "",
				opened && !selected ? explorer_module_css_default.rowOpened : ""
			].filter(Boolean).join(" ");
			(0, react.useEffect)(() => {
				if (!selected) return;
				const row = rowRef.current;
				if (row === null) return;
				const id = window.requestAnimationFrame(() => {
					scrollTreeRowIntoView(row);
				});
				return () => window.cancelAnimationFrame(id);
			}, [selected, expanded]);
			const menuItems = entry.kind === "dir" ? [
				{
					id: "expand-toggle",
					label: expanded ? t("collapse") : t("expand"),
					onSelect: () => {
						toggleExpand();
					}
				},
				{
					id: "reveal",
					label: t("revealPathInFileManager"),
					onSelect: () => {
						revealInFileManager();
					}
				},
				{
					id: "new-file",
					label: t("newFile"),
					onSelect: () => {
						startChildDraft("file");
					}
				},
				{
					id: "new-folder",
					label: t("newFolder"),
					onSelect: () => {
						startChildDraft("dir");
					}
				},
				{
					id: "rename",
					label: t("rename"),
					onSelect: () => {
						setRenaming(true);
					}
				},
				{
					id: "delete",
					label: t("delete"),
					danger: true,
					onSelect: () => {
						remove();
					}
				}
			] : [
				{
					id: "reveal",
					label: t("revealPathInFileManager"),
					onSelect: () => {
						revealInFileManager();
					}
				},
				{
					id: "rename",
					label: t("rename"),
					onSelect: () => {
						setRenaming(true);
					}
				},
				{
					id: "delete",
					label: t("delete"),
					danger: true,
					onSelect: () => {
						remove();
					}
				}
			];
			return (0, react_jsx_runtime.jsxs)("li", { children: [
				renaming ? (0, react_jsx_runtime.jsx)(InlineNameInput, {
					depth,
					kind: entry.kind,
					initialValue: entry.name,
					placeholder: t("promptRename"),
					ariaLabel: t("rename"),
					onCancel: () => setRenaming(false),
					onCommit: (name) => {
						commitRename(name);
					}
				}) : (0, react_jsx_runtime.jsxs)("div", {
					ref: rowRef,
					className: rowClass,
					style: { paddingLeft: 8 + depth * 12 },
					title: entry.path || entry.name,
					"data-file-explorer-path": entry.path,
					"data-file-explorer-kind": entry.kind,
					"data-active-file": opened ? "true" : void 0,
					role: "treeitem",
					"aria-selected": selected,
					"aria-expanded": entry.kind === "dir" ? expanded : void 0,
					onClick: (event) => {
						event.currentTarget.focus();
						onRowClick();
					},
					onContextMenu: (event) => {
						event.preventDefault();
						event.stopPropagation();
						onSelect(entry.path);
						setMenu({
							x: event.clientX,
							y: event.clientY
						});
					},
					onKeyDown: (event) => {
						if (entry.kind === "dir" && event.key === "ArrowRight") {
							event.preventDefault();
							if (!expanded) {
								onSelect(entry.path);
								setExpanded(true);
							} else {
								const firstChild = event.currentTarget.parentElement?.querySelector('ul[role="group"] [role="treeitem"]');
								if (firstChild) {
									onSelect(firstChild.getAttribute("data-file-explorer-path"));
									firstChild.focus();
								}
							}
							return;
						}
						if (entry.kind === "dir" && event.key === "ArrowLeft") {
							event.preventDefault();
							if (expanded) {
								onSelect(entry.path);
								setExpanded(false);
							} else {
								const parent = event.currentTarget.closest('ul[role="group"]')?.parentElement?.querySelector(':scope > [role="treeitem"]');
								if (parent) {
									onSelect(parent.getAttribute("data-file-explorer-path"));
									parent.focus();
								}
							}
							return;
						}
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							onRowClick();
						}
						if (event.key === "F2") {
							event.preventDefault();
							onSelect(entry.path);
							setRenaming(true);
						}
						if (event.key === "Delete") {
							event.preventDefault();
							event.stopPropagation();
							onSelect(entry.path);
							void remove();
						}
					},
					tabIndex: 0,
					children: [
						entry.kind === "dir" ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: explorer_module_css_default.chevronBtn,
							"aria-label": expanded ? t("collapse") : t("expand"),
							tabIndex: -1,
							onClick: (event) => {
								event.preventDefault();
								event.stopPropagation();
								onSelect(entry.path);
								toggleExpand();
							},
							children: (0, react_jsx_runtime.jsx)(Chevron, { open: expanded })
						}) : (0, react_jsx_runtime.jsx)("span", { className: explorer_module_css_default.chevronPlaceholder }),
						entry.kind === "dir" ? (0, react_jsx_runtime.jsx)(FolderIcon, { open: expanded }) : (0, react_jsx_runtime.jsx)(FileIcon, { name: entry.name }),
						(0, react_jsx_runtime.jsxs)("span", {
							className: explorer_module_css_default.label,
							children: [entry.name, loading ? "…" : ""]
						})
					]
				}),
				menu !== null ? (0, react_jsx_runtime.jsx)(ExplorerContextMenu, {
					x: menu.x,
					y: menu.y,
					onClose: () => setMenu(null),
					items: menuItems
				}) : null,
				entry.kind === "dir" && expanded ? (0, react_jsx_runtime.jsxs)("ul", {
					className: explorer_module_css_default.children,
					role: "group",
					children: [
						childDraft !== null ? (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)(InlineNameInput, {
							depth: depth + 1,
							kind: childDraft,
							initialValue: "",
							placeholder: childDraft === "file" ? t("promptNewFile") : t("promptNewFolder"),
							ariaLabel: childDraft === "file" ? t("newFile") : t("newFolder"),
							onCancel: () => setChildDraft(null),
							onCommit: (name) => {
								commitChildCreate(childDraft, name);
							}
						}) }, `draft-${childDraft}`) : null,
						children !== null ? children.map((child) => (0, react_jsx_runtime.jsx)(TreeNode, {
							entry: child,
							depth: depth + 1,
							api,
							t,
							activePath,
							selectedPath,
							onSelect,
							onOpenFile,
							onError,
							onTreeMutated,
							refreshToken,
							expandSignal,
							collapseSignal,
							external
						}, child.path)) : null,
						children !== null && children.length === 0 && childDraft === null ? (0, react_jsx_runtime.jsx)("li", {
							className: explorer_module_css_default.emptyChild,
							style: { paddingLeft: 8 + (depth + 1) * 12 },
							children: t("emptyWorkspace")
						}) : null
					]
				}) : null
			] });
		}
		//#endregion
		//#region lib/types/client/explorer/ExplorerPanel.js
		/**
		* Sidebar explorer panel: workspace header + icon actions + root listing.
		*/
		var PanelBoundary = class extends react.Component {
			state = { message: null };
			static getDerivedStateFromError(error) {
				return { message: error.message };
			}
			componentDidCatch(error, info) {
				console.error("[dsh-vscode] panel crash", error, info);
			}
			render() {
				if (this.state.message !== null) return (0, react_jsx_runtime.jsx)("div", {
					className: explorer_module_css_default.errorBanner,
					children: this.state.message
				});
				return this.props.children;
			}
		};
		/** Basename for display; browser bundle may not have node:path — keep a fallback. */
		function workspaceLabel(root) {
			const normalized = root.replaceAll("\\", "/").replace(/\/+$/, "");
			return (normalized.includes("/") ? normalized.slice(normalized.lastIndexOf("/") + 1) : normalized) || root || "workspace";
		}
		/**
		* Root listing with create-file / create-dir actions.
		*/
		function ExplorerPanel(props) {
			return (0, react_jsx_runtime.jsx)(PanelBoundary, { children: (0, react_jsx_runtime.jsx)(ExplorerPanelInner, { ...props }) });
		}
		function ExplorerPanelInner(props) {
			const { ctx, api, tabs, onOpenFile, external, sessionId, sessionCwd, sessionTitle } = props;
			const t = useExplorerT(ctx);
			const activePath = (0, react.useSyncExternalStore)(tabs.subscribe, () => tabs.getSnapshot().activePath);
			const [entries, setEntries] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)(null);
			const [refreshToken, setRefreshToken] = (0, react.useState)(0);
			const [expandSignal, setExpandSignal] = (0, react.useState)(0);
			const [collapseSignal, setCollapseSignal] = (0, react.useState)(0);
			const [rootDraft, setRootDraft] = (0, react.useState)(null);
			const [selectedPath, setSelectedPath] = (0, react.useState)(null);
			const [rootPath, setRootPath] = (0, react.useState)("");
			const [wsMenuOpen, setWsMenuOpen] = (0, react.useState)(false);
			const [workspaceList, setWorkspaceList] = (0, react.useState)([]);
			/**
			* The folder that belongs to THIS session, as resolved by the pin. Empty
			* until the pin lands (or when it could not resolve one at all), which is
			* exactly when the ownership strip below must stay hidden.
			*/
			const [sessionDir, setSessionDir] = (0, react.useState)("");
			/**
			* What the host found in this session's own log: how many files it
			* produced vs. merely read. `null` until the first collection lands.
			*/
			const [sessionFiles, setSessionFiles] = (0, react.useState)(null);
			const onSessionResolved = (0, react.useCallback)((path, files) => {
				setSessionDir(path);
				setSessionFiles(files);
			}, []);
			/** Bumped on every menu open/close so a stale async list is discarded. */
			const wsMenuToken = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				if (activePath !== null) setSelectedPath(activePath);
			}, [activePath]);
			const reload = (0, react.useCallback)(async () => {
				const [listResult, rootResult] = await Promise.all([api.list(""), api.getRoot()]);
				if (rootResult.ok) setRootPath(rootResult.value.root);
				if (!listResult.ok) {
					setError(listResult.error.message);
					return;
				}
				setError(null);
				setEntries(listResult.value.entries);
			}, [api]);
			/* The root follows the session this view renders — see useSessionRootPin. */
			const holdPin = useSessionRootPin(sessionId, sessionCwd, sessionTitle, api, reload, onSessionResolved);
			(0, react.useEffect)(() => {
				reload();
			}, [reload, refreshToken]);
			/** A change at the workspace root (a new or removed top-level entry). */
			(0, react.useEffect)(() => {
				if (external === null) return;
				if (!external.dirs.has("")) return;
				reload();
			}, [external, reload]);
			const bump = () => {
				setRefreshToken((n) => n + 1);
			};
			/**
			 * The root can move without this panel asking — the session pin owns it
			 * and re-roots the explorer whenever the open session changes. Re-read
			 * both the root and the listing on that signal, otherwise the tree keeps
			 * showing the previous session's folder.
			 */
			(0, react.useEffect)(() => {
				const onRoot = () => {
					setSelectedPath(null);
					bump();
				};
				window.addEventListener("file-explorer:root-changed", onRoot);
				return () => window.removeEventListener("file-explorer:root-changed", onRoot);
			}, []);
			const commitRootCreate = async (kind, name) => {
				setRootDraft(null);
				const path = name;
				if (kind === "file") {
					// -1 = "no expected revision": this file did not exist before.
					const result = await api.write(path, "", -1);
					if (!result.ok) {
						setError(result.error.message);
						return;
					}
					bump();
					setSelectedPath(path);
					onOpenFile(path);
					return;
				}
				const result = await api.mkdir(path);
				if (!result.ok) {
					setError(result.error.message);
					return;
				}
				bump();
				setSelectedPath(path);
			};
			const revealRoot = async () => {
				const result = await api.revealRoot();
				if (!result.ok) setError(result.error.message);
			};
			/** Switch the host root — used by the workspace picker, the breadcrumb and the session strip. */
			const setRootTo = async (path) => {
				/* Hand-driven navigation wins: without this the next session-list
				 * update would drag the tree back to the session folder. */
				holdPin();
				const result = await api.setRoot(path);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				setSelectedPath(null);
				bump();
				/* PATCH(2026-10-13): the subagent seat is scoped to the root — tell it. */
				window.dispatchEvent(new CustomEvent("file-explorer:root-changed", { detail: { root: result.value.root } }));
			};
			/**
			* Every folder this app already treats as a workspace, in the order the
			* left rail renders them.
			*
			* PATCH(2026-10-13): the authoritative source is the host's
			* `workspaceRegistry` (see `listWorkspaces` in the host service) — the
			* same durable records that back the left-rail workspace rows, each with
			* its own `path`. Reading it is what makes "one workspace ⇄ one folder"
			* hold: choosing a workspace roots the explorer at THAT workspace's
			* directory instead of at whatever cwd the open session happens to carry.
			*
			* Reading session cwds is kept as a fallback (and a union) because the
			* host profile may not load the workspace bundle, and because a session
			* cwd is still a meaningful folder to jump to even when it is not yet a
			* registered workspace.
			*/
			const collectWorkspaces = async () => {
				const out = [];
				const seen = new Set();
				const push = (value, label) => {
					if (typeof value !== "string" || value.trim() === "") return;
					const normalized = value.replaceAll("\\", "/").replace(/\/+$/, "");
					const key = normalized.toLowerCase();
					if (seen.has(key)) return;
					seen.add(key);
					out.push({
						path: value,
						label: typeof label === "string" && label !== "" ? label : workspaceLabel(value)
					});
				};
				try {
					const result = await api.listWorkspaces();
					console.info("[dsh-vscode] workspaceRegistry:", result.ok ? `${result.value.workspaces.length} entr${result.value.workspaces.length === 1 ? "y" : "ies"}` : `unavailable (${result.error.message})`);
					if (result.ok) for (const entry of result.value.workspaces) push(entry.path, entry.title);
				} catch {
					/* host registry unavailable — session cwds still apply */
				}
				try {
					const sessions = ctx.sessions;
					if (sessions !== void 0) {
						const snap = sessions.list.getSnapshot();
						for (const sessionId of Object.keys(snap.byId ?? {})) push(snap.byId[sessionId]?.cwd);
					}
				} catch {
					/* sessions service is optional */
				}
				/* The live root is normally a session folder NESTED inside one of the
				 * workspaces above, and that row already exists under its parent —
				 * surfacing it again would read as a phantom fourth workspace. Only a
				 * root that lies outside every known workspace (a folder opened by
				 * hand) earns its own row. */
				const flat = (value) => value.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
				const here = flat(rootPath);
				const nested = out.some((entry) => {
					const base = flat(entry.path);
					return here === base || here.startsWith(`${base}/`);
				});
				if (!nested) push(rootPath);
				return out;
			};
			const toggleWorkspaceMenu = () => {
				if (wsMenuOpen) {
					wsMenuToken.current++;
					setWsMenuOpen(false);
					return;
				}
				setWorkspaceList([]);
				setWsMenuOpen(true);
				const token = ++wsMenuToken.current;
				void collectWorkspaces().then((list) => {
					/* Drop the result when the menu closed (or reopened) meanwhile. */
					if (wsMenuToken.current !== token) return;
					setWorkspaceList(list);
				});
			};
			/** True when `path` is the folder the explorer is currently rooted at. */
			const isCurrentWorkspace = (path) => {
				if (typeof rootPath !== "string" || rootPath === "") return false;
				return rootPath.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase() === path.replaceAll("\\", "/").replace(/\/+$/, "").toLowerCase();
			};
			/** Root path split into clickable segments (`D:` / `30651` / `proj` …). */
			const crumbs = (() => {
				if (typeof rootPath !== "string" || rootPath === "") return [];
				const parts = rootPath.split(/[\\/]+/).filter((part) => part !== "");
				let acc = "";
				return parts.map((part, index) => {
					acc = index === 0 ? part : `${acc}/${part}`;
					return {
						label: part,
						path: index === 0 ? `${part}/` : acc,
						clickable: index > 0
					};
				});
			})();
			const title = workspaceLabel(rootPath);
			/** True while the tree really is rooted at this session's own folder. */
			const atSessionDir = sessionDir !== "" && isCurrentWorkspace(sessionDir);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: explorer_module_css_default.panel,
				"data-file-explorer-panel": "",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: explorer_module_css_default.toolbar,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							style: {
								position: "relative",
								display: "flex",
								alignItems: "center",
								minWidth: 0,
								flex: 1
							},
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "workspacePicker",
								title: rootPath || void 0,
								"aria-haspopup": "menu",
								"aria-expanded": wsMenuOpen ? "true" : "false",
								onClick: toggleWorkspaceMenu,
								children: [(0, react_jsx_runtime.jsx)("span", {
									style: { overflow: "hidden", textOverflow: "ellipsis" },
									children: title
								}), (0, react_jsx_runtime.jsx)("span", {
									style: { opacity: .5, fontSize: "10px", flexShrink: 0 },
									children: "▾"
								})]
							}), wsMenuOpen ? (0, react_jsx_runtime.jsx)("div", {
								style: { position: "fixed", inset: 0, zIndex: 29 },
								onClick: () => setWsMenuOpen(false)
							}) : null, wsMenuOpen ? (0, react_jsx_runtime.jsx)("div", {
								className: "workspaceMenu",
								role: "menu",
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "menuitem",
								className: "workspaceMenuItem",
								onClick: () => {
									const input = window.prompt(t("wsPrompt"), rootPath);
									if (typeof input === "string" && input.trim() !== "") {
										setWsMenuOpen(false);
										void setRootTo(input.trim());
									}
								},
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: "workspaceMenuLabel",
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: "workspaceMenuCheck",
										style: { visibility: "hidden" },
										children: "✓"
									}), t("wsOpenOther")]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: "workspaceMenuSection",
									children: t("wsWorkspaces")
								})]
						}), workspaceList.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: "workspaceMenuHint",
							children: t("wsLoading")
						}) : null, workspaceList.map((entry) => {
							const current = isCurrentWorkspace(entry.path);
							return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "menuitem",
								className: "workspaceMenuItem",
								"data-current": current ? "true" : void 0,
								title: entry.path,
								onClick: () => {
									setWsMenuOpen(false);
									void setRootTo(entry.path);
								},
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: "workspaceMenuLabel",
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: "workspaceMenuCheck",
										style: { visibility: current ? "visible" : "hidden" },
										children: "✓"
									}), entry.label]
								}), (0, react_jsx_runtime.jsx)("span", {
									className: "workspaceMenuPath",
									children: entry.path
								})]
							}, entry.path)] }, `ws:${entry.path}`);
						})]
							}) : null]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: explorer_module_css_default.toolbarActions,
							children: [
								(0, react_jsx_runtime.jsx)(NewFileIconButton, {
									title: t("newFile"),
									onClick: () => setRootDraft("file")
								}),
								(0, react_jsx_runtime.jsx)(NewFolderIconButton, {
									title: t("newFolder"),
									onClick: () => setRootDraft("dir")
								}),
								(0, react_jsx_runtime.jsx)(ExpandAllIconButton, {
									title: t("expandAll"),
									onClick: () => setExpandSignal((n) => n + 1)
								}),
								(0, react_jsx_runtime.jsx)(CollapseAllIconButton, {
									title: t("collapseAll"),
									onClick: () => setCollapseSignal((n) => n + 1)
								}),
								(0, react_jsx_runtime.jsx)(RefreshIconButton, {
									title: t("refresh"),
									onClick: () => bump()
								}),
								(0, react_jsx_runtime.jsx)(RevealIconButton, {
									title: t("openInFileManager"),
									onClick: () => void revealRoot()
								})
							]
						})]
					}), crumbs.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: "treeCrumbs",
						children: crumbs.map((crumb, index) => (0, react_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								alignItems: "center",
								minWidth: 0
							},
							children: [index > 0 ? (0, react_jsx_runtime.jsx)("span", {
								className: "crumbSep",
								children: "/"
							}) : null, crumb.clickable ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								title: crumb.path,
								onClick: () => void setRootTo(crumb.path),
								children: crumb.label
							}) : (0, react_jsx_runtime.jsx)("span", {
								children: crumb.label
							})]
						}, crumb.path))
					}) : null,
					/*
					* Says out loud whose folder the tree is showing. The pin roots the
					* tree at the session's own folder silently, and a silent pin is
					* indistinguishable from "the explorer opened the wrong place" —
					* which is exactly how it was read. One row, one jump.
					*/
					sessionId !== "" && sessionDir !== "" ? (0, react_jsx_runtime.jsx)("div", {
						className: "sessionStrip",
						"data-file-explorer-session-strip": atSessionDir ? "self" : "elsewhere",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripBadge",
							children: t("sessionFolderBadge")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripName",
							title: sessionDir,
							children: sessionTitle.trim() === "" ? t("sessionFolderUnnamed") : sessionTitle.trim()
						}), sessionFiles !== null && sessionFiles.total > 0 ? (0, react_jsx_runtime.jsx)("span", {
							className: "sessionStripFiles",
							title: sessionFiles.transcript,
							children: `${t("sessionFilesProduced")} ${sessionFiles.produced} · ${t("sessionFilesTotal")} ${sessionFiles.total}`
						}) : null, (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "sessionStripJump",
							title: atSessionDir ? sessionCwd : sessionDir,
							onClick: () => void setRootTo(atSessionDir ? sessionCwd : sessionDir),
							children: atSessionDir ? t("sessionFolderWorkspace") : t("sessionFolderSelf")
						})]
					}) : null,
					error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.errorBanner,
						children: error
					}) : null,
					entries.length === 0 && rootDraft === null ? (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.empty,
						children: t("emptyWorkspace")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: explorer_module_css_default.treeScroll,
						"data-file-explorer-tree-scroll": "",
						onKeyDown: (event) => {
							if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
							if (event.target.closest("[data-file-explorer-inline-edit]")) return;
							const rows = Array.from(event.currentTarget.querySelectorAll('[role="treeitem"]'));
							if (rows.length === 0) return;
							const focused = event.target.closest('[role="treeitem"]');
							const selected = rows.findIndex((row) => row.getAttribute("aria-selected") === "true");
							const current = Math.max(0, focused === null ? selected : rows.indexOf(focused));
							const next = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : Math.max(0, Math.min(rows.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
							const row = rows[next];
							const path = row.getAttribute("data-file-explorer-path");
							if (path !== null) setSelectedPath(path);
							row.focus();
							row.scrollIntoView({ block: "nearest" });
							event.preventDefault();
							event.stopPropagation();
						},
						children: (0, react_jsx_runtime.jsxs)("ul", {
							className: explorer_module_css_default.tree,
							role: "tree",
							children: [rootDraft !== null ? (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)(InlineNameInput, {
								depth: 0,
								kind: rootDraft,
								initialValue: "",
								placeholder: rootDraft === "file" ? t("promptNewFile") : t("promptNewFolder"),
								ariaLabel: rootDraft === "file" ? t("newFile") : t("newFolder"),
								onCancel: () => setRootDraft(null),
								onCommit: (name) => {
									commitRootCreate(rootDraft, name);
								}
							}) }, `draft-${rootDraft}`) : null, entries.map((entry) => (0, react_jsx_runtime.jsx)(TreeNode, {
								entry,
								depth: 0,
								api,
								t,
								activePath,
								selectedPath,
								onSelect: setSelectedPath,
								onOpenFile,
								onError: setError,
								onTreeMutated: bump,
								refreshToken,
								expandSignal,
								collapseSignal,
								external
							}, entry.path))]
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/editor/monaco-loader.js
		/**
		* Load Monaco from jsDelivr; callers fall back to textarea on failure.
		*/
		const MONACO_CDN = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs";
		/**
		* Monaco pulls ~1.5 MB of AMD modules from a CDN before the editor can mount,
		* and hitting this budget is a hard fallback: the whole editor is swapped for a
		* plain textarea. The original 12s was too tight on a slow or proxied link
		* (intermittent fallbacks were observed during testing), so allow a far more
		* forgiving budget while still failing eventually on a dead CDN.
		*/
		const LOAD_TIMEOUT_MS = 30e3;
		/**
		* Monaco's per-language worker files (`language/<lang>/<lang>Worker.js`) are AMD
		* modules, not worker entry points — importing one directly throws
		* "define is not defined". The real entry point is `base/worker/workerMain.js`,
		* which ships its own AMD loader and pulls the language module named during the
		* worker handshake.
		*
		* Two constraints shape the wiring below:
		*   1. A cross-origin worker URL is rejected outright, so the worker must be
		*      bootstrapped from a same-origin blob.
		*   2. A blob worker has no meaningful `self.location`, and workerMain falls back
		*      to the relative "../../../" when it cannot see a base URL — which would
		*      resolve against `blob:` and fail. So we hand it an explicit `baseUrl`
		*      pointing at the CDN's `min/` directory (the parent of `vs/`), matching how
		*      the AMD loader maps the `vs/...` module ids.
		*
		* Without any of this the bundled JSON / TS / CSS / HTML language services stay
		* dormant: no completion, no validation, no hover, no definition lookup — and
		* this editor only ever gets plain syntax colouring.
		*/
		const MONACO_WORKER_ENTRY = "base/worker/workerMain.js";
		function ensureMonacoEnvironment() {
			if (typeof window === "undefined" || window.MonacoEnvironment !== void 0) return;
			const baseUrl = MONACO_CDN.replace(/\/vs$/, "/");
			const source = `self.MonacoEnvironment={baseUrl:${JSON.stringify(baseUrl)}};importScripts(${JSON.stringify(`${MONACO_CDN}/${MONACO_WORKER_ENTRY}`)});`;
			let workerUrl = null;
			window.MonacoEnvironment = {
				getWorkerUrl() {
					if (workerUrl === null) workerUrl = URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
					return workerUrl;
				}
			};
		}
		/**
		* Give Monaco's bundled language services usable defaults.
		* Diagnostics are deliberately narrowed: this editor has no tsconfig and no
		* node_modules types, so unresolved-import diagnostics would paint every file
		* red and drown out the genuinely useful syntax and inference errors.
		*/
		function configureMonacoLanguages(monaco) {
			const ts = monaco.languages.typescript;
			if (ts !== void 0) {
				const compilerOptions = {
					target: ts.ScriptTarget.ESNext,
					module: ts.ModuleKind.ESNext,
					moduleResolution: ts.ModuleResolutionKind.NodeJs,
					jsx: ts.JsxEmit.ReactJSX ?? ts.JsxEmit.React,
					allowNonTsExtensions: true,
					allowJs: true,
					esModuleInterop: true,
					skipLibCheck: true,
					noEmit: true,
					strict: false
				};
				ts.typescriptDefaults.setCompilerOptions(compilerOptions);
				ts.javascriptDefaults.setCompilerOptions(compilerOptions);
				ts.typescriptDefaults.setEagerModelSync(true);
				ts.javascriptDefaults.setEagerModelSync(true);
				ts.typescriptDefaults.setDiagnosticsOptions({
					noSemanticValidation: false,
					noSyntaxValidation: false,
					diagnosticCodesToIgnore: [
						2307,
						2792,
						7016,
						2688,
						6133
					]
				});
				ts.javascriptDefaults.setDiagnosticsOptions({
					noSemanticValidation: true,
					noSyntaxValidation: false,
					diagnosticCodesToIgnore: [
						2304,
						2552
					]
				});
			}
			const json = monaco.languages.json;
			if (json !== void 0) json.jsonDefaults.setDiagnosticsOptions({
				validate: true,
				allowComments: true,
				trailingCommas: "warning",
				schemaValidation: "warning"
			});
		}
		let loading = null;
		/**
		* Ensure Monaco AMD loader + editor are available.
		*/
		function loadMonaco() {
			if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("monaco requires a browser"));
			if (window.monaco !== void 0) return Promise.resolve(window.monaco);
			if (loading !== null) return loading;
			loading = new Promise((resolve, reject) => {
				const timer = window.setTimeout(() => {
					loading = null;
					reject(/* @__PURE__ */ new Error("monaco load timed out"));
				}, LOAD_TIMEOUT_MS);
				const finish = (monaco) => {
					window.clearTimeout(timer);
					window.monaco = monaco;
					configureMonacoLanguages(monaco);
					resolve(monaco);
				};
				const startRequire = () => {
					if (window.require === void 0) {
						loading = null;
						window.clearTimeout(timer);
						reject(/* @__PURE__ */ new Error("monaco AMD loader missing"));
						return;
					}
					ensureMonacoEnvironment();
					window.require.config({ paths: { vs: MONACO_CDN } });
					window.require(["vs/editor/editor.main"], (monaco) => {
						finish(monaco);
					});
				};
				if (window.require !== void 0) {
					startRequire();
					return;
				}
				const script = document.createElement("script");
				script.src = `${MONACO_CDN}/loader.js`;
				script.async = true;
				script.onload = () => startRequire();
				script.onerror = () => {
					loading = null;
					window.clearTimeout(timer);
					reject(/* @__PURE__ */ new Error("monaco loader script failed"));
				};
				document.head.appendChild(script);
			}).catch((error) => {
				loading = null;
				throw error;
			});
			return loading;
		}
		/** Map a relative path to a Monaco language id. */
		function languageForPath(path) {
			const lower = path.toLowerCase();
			if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "typescript";
			if (lower.endsWith(".js") || lower.endsWith(".jsx") || lower.endsWith(".mjs")) return "javascript";
			if (lower.endsWith(".json")) return "json";
			if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
			if (lower.endsWith(".css") || lower.endsWith(".scss")) return "css";
			if (lower.endsWith(".html") || lower.endsWith(".htm")) return "html";
			if (lower.endsWith(".yml") || lower.endsWith(".yaml")) return "yaml";
			if (lower.endsWith(".py")) return "python";
			if (lower.endsWith(".go")) return "go";
			if (lower.endsWith(".rs")) return "rust";
			if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "shell";
			return "plaintext";
		}
		/**
		* Build the model URI for a workspace file.
		*
		* Monaco hands anonymous models a bare `inmemory://model/N` URI. The TS worker
		* infers a file's kind from that URI, so an extension-less one makes every `.ts`
		* file look like plain JavaScript — the editor then reports
		* "Type annotations can only be used in TypeScript files" on ordinary TypeScript.
		* Encoding the real relative path keeps each language service on the right file
		* kind (and keeps distinct files in distinct models).
		*/
		function modelUriFor(monaco, path) {
			const encoded = path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
			return monaco.Uri.parse(`inmemory://file-explorer/${encoded}`);
		}
		/**
		* Language ids whose formatter ships inside the stock Monaco build. Anything
		* else needs a provider — that is the gap the LSP bridge would fill later.
		*/
		const FORMATTABLE_LANGUAGES = new Set([
			"javascript",
			"typescript",
			"json",
			"css",
			"html"
		]);
		//#endregion
		//#region lib/types/client/editor/appearance.js
		/**
		* Persisted Monaco / textarea appearance (theme, optional custom bg, font size, schemes).
		* Intentionally not named themeStore — keep clear of upstream naming.
		*/
		const STORAGE_KEY = "dsh-vscode:editor-appearance";
		const SCHEMES_KEY = "dsh-vscode:editor-appearance-schemes";
		/**
		* Records that the user picked a theme by hand.
		*
		* Deliberately separate from the appearance blob: font size, custom background
		* and saved schemes are unrelated concerns, and only an explicit theme choice
		* should stop the import from following the VSCode configuration.
		*/
		const THEME_CHOICE_KEY = "dsh-vscode:theme-chosen";
		const FONT_MIN = 11;
		const FONT_MAX = 24;
		const FONT_DEFAULT = 13;
		const SCHEMES_MAX = 12;
		const CUSTOM_THEME_ID = "dsh-vscode-custom";
		const THEMES = [
			"vs-dark",
			"vs",
			"hc-black"
		];
		const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
		function clampFont(size) {
			if (!Number.isFinite(size)) return FONT_DEFAULT;
			return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(size)));
		}
		function parseTheme(raw) {
			if (THEMES.includes(raw)) return raw;
			return raw === VSCODE_THEME_ID ? VSCODE_THEME_ID : "vs-dark";
		}
		/** Normalize and validate an HTML hex color; returns null when invalid. */
		function normalizeHexColor(raw) {
			const trimmed = raw.trim();
			if (!HEX_RE.test(trimmed)) return null;
			if (trimmed.length === 4) {
				const r = trimmed[1];
				const g = trimmed[2];
				const b = trimmed[3];
				return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
			}
			return trimmed.toLowerCase();
		}
		/** Color input (`#rrggbb`) value derived from a stored custom color. */
		function hexForColorInput(custom, theme) {
			if (custom !== null) {
				if (custom.length === 9) return custom.slice(0, 7);
				return custom;
			}
			if (theme === "vs") return "#ffffff";
			if (theme === "hc-black") return "#000000";
			return "#1e1e1e";
		}
		function parseCustomBackground(raw) {
			if (typeof raw !== "string") return null;
			return normalizeHexColor(raw);
		}
		function newSchemeId() {
			return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
		}
		function parseSchemes(raw) {
			if (!Array.isArray(raw)) return [];
			const out = [];
			for (const item of raw) {
				if (item === null || typeof item !== "object") continue;
				const row = item;
				const background = typeof row.background === "string" ? normalizeHexColor(row.background) : null;
				if (background === null) continue;
				const fontSize = clampFont(typeof row.fontSize === "number" ? row.fontSize : FONT_DEFAULT);
				const id = typeof row.id === "string" && row.id.length > 0 ? row.id : newSchemeId();
				out.push({
					id,
					background,
					fontSize
				});
				if (out.length >= SCHEMES_MAX) break;
			}
			return out;
		}
		function defaults() {
			return {
				theme: "vs-dark",
				customBackground: null,
				fontSize: FONT_DEFAULT,
				minimap: false,
				schemes: []
			};
		}
		function readStoredAppearance() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return {
					theme: "vs-dark",
					customBackground: null,
					fontSize: FONT_DEFAULT,
					minimap: false
				};
				const parsed = JSON.parse(raw);
				return {
					theme: parseTheme(parsed.theme),
					customBackground: parseCustomBackground(parsed.customBackground),
					fontSize: clampFont(typeof parsed.fontSize === "number" ? parsed.fontSize : FONT_DEFAULT),
					minimap: parsed.minimap === true
				};
			} catch {
				return {
					theme: "vs-dark",
					customBackground: null,
					fontSize: FONT_DEFAULT,
					minimap: false
				};
			}
		}
		function readStoredSchemes() {
			try {
				const raw = window.localStorage.getItem(SCHEMES_KEY);
				if (raw === null) return [];
				return parseSchemes(JSON.parse(raw));
			} catch {
				return [];
			}
		}
		/**
		* Mutable appearance prefs with subscribe semantics for React.
		* `getSnapshot` MUST return a stable reference between mutations.
		*/
		var EditorAppearanceStore = class {
			#theme = "vs-dark";
			#customBackground = null;
			#fontSize = FONT_DEFAULT;
			#minimap = false;
			#schemes = [];
			#hydrated = false;
			#snapshot = defaults();
			#listeners = /* @__PURE__ */ new Set();
			getSnapshot = () => this.#snapshot;
			subscribe = (listener) => {
				this.#listeners.add(listener);
				return () => {
					this.#listeners.delete(listener);
				};
			};
			/** Load from localStorage once on the client. */
			hydrate() {
				if (this.#hydrated) return;
				this.#hydrated = true;
				if (typeof window === "undefined") return;
				const next = readStoredAppearance();
				// Migration: an appearance blob saved before theme-choice tracking
				// existed counts as a deliberate pick only when it actually moved away
				// from the defaults. A blob that merely carries a custom font size has
				// the default theme in it, so it must stay open to the VSCode import —
				// otherwise every pre-existing user would silently keep the old theme
				// and never see the one they actually use.
				if (window.localStorage.getItem(THEME_CHOICE_KEY) === null && window.localStorage.getItem(STORAGE_KEY) !== null && (next.theme !== "vs-dark" || next.customBackground !== null)) {
					try {
						window.localStorage.setItem(THEME_CHOICE_KEY, "1");
					} catch {
						/* storage unavailable */
					}
				}
				this.#theme = next.theme;
				this.#customBackground = next.customBackground;
				this.#fontSize = next.fontSize;
				this.#minimap = next.minimap;
				this.#schemes = readStoredSchemes();
				this.#refreshSnapshot();
				this.#emit();
			}
			/**
			* Whether the user ever picked a theme by hand.
			*
			* Gates the VSCode import: an import may seed and keep following the VSCode
			* theme, but must never override a deliberate choice made here.
			*/
			hasThemeChoice() {
				if (typeof window === "undefined") return false;
				return window.localStorage.getItem(THEME_CHOICE_KEY) !== null;
			}
			/**
			* Apply an imported theme.
			*
			* Unlike `setTheme` this does not record a theme choice, so the import keeps
			* tracking the VSCode configuration on subsequent loads.
			*/
			adoptTheme(theme) {
				if (this.#theme === theme && this.#customBackground === null) return;
				this.#theme = theme;
				this.#customBackground = null;
				this.#refreshSnapshot();
				this.#emit();
			}
			#rememberThemeChoice() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(THEME_CHOICE_KEY, "1");
				} catch {
					/* storage unavailable; the import simply stays free to apply */
				}
			}
			setTheme(theme) {
				if (this.#theme === theme && this.#customBackground === null) return;
				this.#theme = theme;
				this.#customBackground = null;
				this.#rememberThemeChoice();
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			/**
			* Set or clear a custom background hex.
			* @returns whether the value was accepted (invalid hex ignored when non-empty).
			*/
			setCustomBackground(raw) {
				if (raw === null || raw.trim() === "") {
					if (this.#customBackground === null) return true;
					this.#customBackground = null;
					this.#refreshSnapshot();
					this.#persistAppearance();
					this.#emit();
					return true;
				}
				const next = normalizeHexColor(raw);
				if (next === null) return false;
				if (this.#customBackground === next) return true;
				this.#customBackground = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
				return true;
			}
			setFontSize(size) {
				const next = clampFont(size);
				if (this.#fontSize === next) return;
				this.#fontSize = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			setMinimap(enabled) {
				const next = enabled === true;
				if (this.#minimap === next) return;
				this.#minimap = next;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
			}
			bumpFont(delta) {
				this.setFontSize(this.#fontSize + delta);
			}
			/**
			* Persist current color + font as a named scheme.
			* @param backgroundOverride optional hex (e.g. menu draft) instead of current store color.
			* @returns whether a scheme was written.
			*/
			saveScheme(backgroundOverride) {
				const background = (backgroundOverride !== void 0 ? normalizeHexColor(backgroundOverride) : null) ?? this.#customBackground ?? hexForColorInput(null, this.#theme);
				const fontSize = this.#fontSize;
				const existing = this.#schemes.findIndex((s) => s.background === background && s.fontSize === fontSize);
				if (existing >= 0) {
					const hit = this.#schemes[existing];
					this.#schemes = [hit, ...this.#schemes.filter((_, i) => i !== existing)];
					this.#refreshSnapshot();
					this.#persistSchemes();
					this.#emit();
					return true;
				}
				const next = {
					id: newSchemeId(),
					background,
					fontSize
				};
				this.#schemes = [next, ...this.#schemes].slice(0, SCHEMES_MAX);
				this.#refreshSnapshot();
				this.#persistSchemes();
				this.#emit();
				return true;
			}
			/** Apply a saved scheme (color + font). */
			applyScheme(id) {
				const scheme = this.#schemes.find((s) => s.id === id);
				if (scheme === void 0) return false;
				this.#customBackground = scheme.background;
				this.#fontSize = scheme.fontSize;
				this.#refreshSnapshot();
				this.#persistAppearance();
				this.#emit();
				return true;
			}
			removeScheme(id) {
				const next = this.#schemes.filter((s) => s.id !== id);
				if (next.length === this.#schemes.length) return;
				this.#schemes = next;
				this.#refreshSnapshot();
				this.#persistSchemes();
				this.#emit();
			}
			#refreshSnapshot() {
				this.#snapshot = {
					theme: this.#theme,
					customBackground: this.#customBackground,
					fontSize: this.#fontSize,
					minimap: this.#minimap,
					schemes: this.#schemes
				};
			}
			#persistAppearance() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
						theme: this.#theme,
						customBackground: this.#customBackground,
						fontSize: this.#fontSize,
						minimap: this.#minimap
					}));
				} catch {}
			}
			#persistSchemes() {
				if (typeof window === "undefined") return;
				try {
					window.localStorage.setItem(SCHEMES_KEY, JSON.stringify(this.#schemes));
				} catch {}
			}
			#emit() {
				for (const listener of this.#listeners) listener();
			}
		};
		const EDITOR_CUSTOM_THEME_ID = CUSTOM_THEME_ID;
		//#endregion
		//#region lib/types/client/editor/apply-monaco-appearance.js
		/**
		* Apply appearance prefs to a loaded Monaco namespace (theme + optional custom bg).
		*/
		/**
		* Register / select Monaco theme for the current appearance snapshot.
		*/
		//#region VSCode theme import
		/** Theme id registered for an imported VSCode theme. */
		const VSCODE_THEME_ID = "dsh-vscode-imported";
		/** Resolved VSCode theme, cached so registration stays idempotent. */
		let vscodeThemeDefinition = null;
		/**
		* TextMate scope -> Monaco token.
		*
		* Monaco's Monarch tokenizers emit a far coarser vocabulary than TextMate
		* grammars do, so VSCode scopes are folded onto the tokens Monaco actually
		* produces. Longest matching prefix wins (`keyword.control.flow` -> `keyword`).
		*/
		const VSCODE_SCOPE_ALIASES = [
			[
				"comment",
				"comment"
			],
			[
				"string",
				"string"
			],
			[
				"string.regexp",
				"regexp"
			],
			[
				"constant.numeric",
				"number"
			],
			[
				"constant",
				"constant"
			],
			[
				"keyword",
				"keyword"
			],
			[
				"keyword.operator",
				"operator"
			],
			[
				"storage",
				"keyword"
			],
			[
				"variable.language",
				"keyword"
			],
			[
				"variable",
				"variable"
			],
			[
				"entity.name.function",
				"identifier"
			],
			[
				"support.function",
				"identifier"
			],
			[
				"entity.name.tag",
				"tag"
			],
			[
				"entity.other.attribute-name",
				"attribute.name"
			],
			[
				"entity.name.type",
				"type"
			],
			[
				"entity.name.class",
				"type"
			],
			[
				"support.class",
				"type"
			],
			[
				"support.type",
				"type"
			],
			[
				"punctuation",
				"delimiter"
			],
			[
				"operator",
				"operator"
			],
			[
				"regexp",
				"regexp"
			],
			[
				"invalid",
				"invalid"
			]
		];
		function scopeToMonacoToken(scope) {
			const value = String(scope ?? "").trim();
			if (value === "") return null;
			let best = null;
			let bestLength = 0;
			for (const [prefix, token] of VSCODE_SCOPE_ALIASES) {
				if (value !== prefix && !value.startsWith(`${prefix}.`)) continue;
				if (prefix.length <= bestLength) continue;
				bestLength = prefix.length;
				best = token;
			}
			return best;
		}
		/** Normalise a VSCode colour to `RRGGBB` (Monaco token rules omit the hash). */
		function toTokenColor(value) {
			if (typeof value !== "string") return null;
			const hex = value.trim().replace(/^#/, "");
			if (/^[0-9a-fA-F]{8}$/.test(hex)) return hex.slice(0, 6).toLowerCase();
			if (/^[0-9a-fA-F]{6}$/.test(hex)) return hex.toLowerCase();
			if (/^[0-9a-fA-F]{3}$/.test(hex)) return hex.split("").map((c) => c + c).join("").toLowerCase();
			return null;
		}
		/** Normalise a VSCode colour to `#RRGGBB[AA]` (Monaco palettes keep the hash). */
		function toPaletteColor(value) {
			if (typeof value !== "string") return null;
			const hex = value.trim().replace(/^#/, "");
			if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{8}$/.test(hex)) return `#${hex.toLowerCase()}`;
			if (/^[0-9a-fA-F]{3}$/.test(hex)) return `#${hex.split("").map((c) => c + c).join("").toLowerCase()}`;
			return null;
		}
		/** VSCode theme type -> Monaco base theme id. */
		function vscodeThemeBase(type) {
			const value = String(type ?? "").toLowerCase();
			if (value === "light") return "vs";
			if (value === "hclight") return "hc-light";
			if (value === "hc" || value === "hcblack" || value === "hc-black") return "hc-black";
			return "vs-dark";
		}
		/**
		* Fold a VSCode theme's `tokenColors` into Monaco rules.
		*
		* The Monaco token space is flat, so TextMate specificity has to be resolved
		* here. Scopes are staged narrow-first and generic-last: a `keyword.operator.*`
		* rule is folded onto the `operator` token, but anything that lands on a
		* generic token (say `keyword`) must not let a deep scope paint the whole
		* family. Writing the generic rule last reproduces VSCode's "more specific
		* wins, later wins ties" behaviour as closely as a flat space allows, and
		* also keeps the rule list small.
		*/
		function buildVscodeThemeRules(tokenColors) {
			const staged = [];
			for (const entry of tokenColors) {
				const settings = entry?.settings;
				if (settings === void 0) continue;
				const foreground = toTokenColor(settings.foreground);
				const fontStyle = typeof settings.fontStyle === "string" && settings.fontStyle.trim() !== "" ? settings.fontStyle.trim() : null;
				if (foreground === null && fontStyle === null) continue;
				const scopes = typeof entry.scope === "string" ? entry.scope.split(",") : Array.isArray(entry.scope) ? entry.scope : [];
				for (const rawScope of scopes) {
					const scope = String(rawScope ?? "").trim();
					if (scope === "") continue;
					const token = scopeToMonacoToken(scope);
					if (token === null) continue;
					const rule = { token };
					if (foreground !== null) rule.foreground = foreground;
					if (fontStyle !== null) rule.fontStyle = fontStyle;
					staged.push({
						depth: scope.split(".").filter(Boolean).length,
						token,
						rule
					});
				}
			}
			staged.sort((a, b) => b.depth - a.depth);
			const byToken = new Map();
			for (const item of staged) byToken.set(item.token, item.rule);
			return [...byToken.values()];
		}
		/**
		* Register the imported VSCode theme with Monaco.
		* Only editor-scoped palette keys are forwarded: a VSCode theme carries
		* workbench-wide colours that Monaco has no concept of.
		*/
		function defineVscodeTheme(monaco, theme) {
			const colors = {};
			for (const [key, value] of Object.entries(theme.colors ?? {})) {
				if (!key.startsWith("editor") && !key.startsWith("minimap") && !key.startsWith("scrollbarSlider") && !key.startsWith("editorOverviewRuler")) continue;
				const palette = toPaletteColor(value);
				if (palette !== null) colors[key] = palette;
			}
			monaco.editor.defineTheme(VSCODE_THEME_ID, {
				base: vscodeThemeBase(theme.type),
				inherit: true,
				rules: buildVscodeThemeRules(Array.isArray(theme.tokenColors) ? theme.tokenColors : []),
				colors
			});
			vscodeThemeDefinition = theme;
		}
		/**
		* Re-register the imported theme before any `setTheme` call.
		* Monaco requires a theme to be defined first, and the definition lives in
		* this module rather than in the persisted appearance, so registration has to
		* happen on every path that applies appearance.
		*/
		function ensureVscodeTheme(monaco) {
			if (vscodeThemeDefinition === null) return false;
			defineVscodeTheme(monaco, vscodeThemeDefinition);
			return true;
		}
		//#endregion
		function applyMonacoAppearance(monaco, appearance) {
			ensureVscodeTheme(monaco);
			const custom = appearance.customBackground;
			if (custom === null) {
				monaco.editor.setTheme(appearance.theme);
				return;
			}
			const base = appearance.theme === "vs" ? "vs" : appearance.theme === "hc-black" ? "hc-black" : "vs-dark";
			monaco.editor.defineTheme(EDITOR_CUSTOM_THEME_ID, {
				base,
				inherit: true,
				rules: [],
				colors: {
					"editor.background": custom,
					"editorGutter.background": custom,
					"editorLineNumber.foreground": base === "vs" ? "#237893" : "#858585"
				}
			});
			monaco.editor.setTheme(EDITOR_CUSTOM_THEME_ID);
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/ui/dsh-plugin-file-explorer/src/client/editor/editor.module.css.mjs
		const css$2 = ".VX-wEW_surface{background:var(--dsw-alias-bg-layer-1);height:100%;min-height:0;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex}.VX-wEW_tabs{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);flex-shrink:0;align-items:stretch;gap:2px;padding:0 8px;display:flex;overflow-x:auto}.VX-wEW_tab{color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-bottom:2px solid #0000;align-items:center;gap:6px;padding:8px 10px;font-size:13px;display:flex}.VX-wEW_tabActive{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-brand-primary)}.VX-wEW_dirtyMark{color:var(--dsw-alias-brand-primary)}.VX-wEW_closeBtn{appearance:none;color:inherit;font:inherit;cursor:pointer;opacity:.6;background:0 0;border:0;border-radius:4px;padding:2px 4px;font-size:12px;line-height:1}.VX-wEW_closeBtn:hover{opacity:1;background:var(--dsw-alias-bg-layer-3)}.VX-wEW_toolbar{border-bottom:1px solid var(--dsw-alias-border-l2);flex-shrink:0;align-items:center;gap:8px;padding:6px 10px;display:flex}.VX-wEW_toolBtn{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:inherit;font:inherit;cursor:pointer;border-radius:6px;padding:4px 10px;font-size:12px}.VX-wEW_toolBtn:hover{border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_toolBtnActive{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.VX-wEW_status{color:var(--dsw-alias-label-secondary);margin-left:auto;font-size:12px}.VX-wEW_pathBar{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);white-space:nowrap;text-overflow:ellipsis;user-select:text;flex-shrink:0;padding:4px 12px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;line-height:1.4;overflow:hidden}.VX-wEW_toolbarEnd{flex-shrink:0;align-items:center;display:flex;position:relative}.VX-wEW_appearanceMenu{z-index:20;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:220px;box-shadow:0 10px 28px color-mix(in srgb, var(--dsw-alias-label-primary) 14%, transparent);border-radius:10px;flex-direction:column;gap:12px;padding:10px;display:flex;position:absolute;top:calc(100% + 6px);right:0}.VX-wEW_appearanceSection{flex-direction:column;gap:6px;display:flex}.VX-wEW_appearanceLabel{color:var(--dsw-alias-label-secondary);font-size:12px}.VX-wEW_appearanceThemeRow{flex-wrap:wrap;gap:6px;display:flex}.VX-wEW_appearanceChip{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:inherit;font:inherit;cursor:pointer;border-radius:999px;padding:4px 10px;font-size:12px}.VX-wEW_appearanceChip:hover{border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_appearanceChipActive{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.VX-wEW_appearanceFontRow{align-items:center;gap:8px;display:flex}.VX-wEW_appearanceStep{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:inherit;min-width:36px;height:28px;font:inherit;cursor:pointer;border-radius:6px;padding:0 8px;font-size:12px}.VX-wEW_appearanceStep:hover:not(:disabled){border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_appearanceStep:disabled{opacity:.45;cursor:default}.VX-wEW_appearanceFontValue{text-align:center;font-variant-numeric:tabular-nums;min-width:48px;font-size:13px}.VX-wEW_appearanceColorRow{align-items:center;gap:6px;display:flex}.VX-wEW_appearanceColorSwatch{border:1px solid var(--dsw-alias-border-l2);cursor:pointer;background:0 0;border-radius:6px;flex-shrink:0;width:28px;height:28px;padding:0}.VX-wEW_appearanceHexInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);min-width:0;height:28px;color:var(--dsw-alias-label-primary);font:inherit;border-radius:6px;outline:none;flex:1;padding:0 8px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px}.VX-wEW_appearanceHexInput:focus{border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_appearanceHexInvalid{border-color:var(--dsw-alias-danger,#c44)}.VX-wEW_appearanceHint{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.35}.VX-wEW_appearanceSaveScheme{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:inherit;height:28px;font:inherit;cursor:pointer;border-radius:6px;align-self:flex-start;padding:0 10px;font-size:12px}.VX-wEW_appearanceSaveScheme:hover{border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_appearanceSchemeList{flex-direction:column;gap:4px;max-height:140px;margin:0;padding:0;list-style:none;display:flex;overflow-y:auto}.VX-wEW_appearanceSchemeItem{align-items:center;gap:4px;display:flex}.VX-wEW_appearanceSchemeApply{appearance:none;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);min-width:0;color:inherit;height:28px;font:inherit;cursor:pointer;text-align:left;border-radius:6px;flex:1;align-items:center;gap:8px;padding:0 8px;font-size:12px;display:flex}.VX-wEW_appearanceSchemeApply:hover{border-color:var(--dsw-alias-label-dimmed)}.VX-wEW_appearanceSchemeApplyActive{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}.VX-wEW_appearanceSchemeSwatch{border:1px solid var(--dsw-alias-border-l2);border-radius:3px;flex-shrink:0;width:14px;height:14px}.VX-wEW_appearanceSchemeMeta{text-overflow:ellipsis;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;overflow:hidden}.VX-wEW_appearanceSchemeRemove{appearance:none;color:var(--dsw-alias-label-secondary);width:28px;height:28px;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:6px;flex-shrink:0;font-size:16px;line-height:1}.VX-wEW_appearanceSchemeRemove:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-3)}.VX-wEW_body{flex:1;min-height:0;position:relative}.VX-wEW_textarea{resize:none;background:var(--dsw-alias-bg-layer-1);width:100%;height:100%;color:var(--dsw-alias-label-primary);box-sizing:border-box;border:0;outline:none;padding:12px 14px;font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}.VX-wEW_monacoHost{width:100%;height:100%}.VX-wEW_preview{box-sizing:border-box;height:100%;padding:16px 20px;line-height:1.55;overflow:auto}.VX-wEW_preview h1,.VX-wEW_preview h2,.VX-wEW_preview h3{margin:.8em 0 .4em}.VX-wEW_preview pre{background:var(--dsw-alias-bg-layer-3);border-radius:8px;padding:10px 12px;overflow:auto}.VX-wEW_preview code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:.92em}.VX-wEW_empty{height:100%;color:var(--dsw-alias-label-secondary);place-items:center;font-size:14px;display:grid}.VX-wEW_errorBanner{color:var(--dsw-alias-danger,#c44);border-bottom:1px solid var(--dsw-alias-border-l2);flex-shrink:0;padding:6px 12px}";
		const tagId$2 = "dsh-vscode/editor.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-vscode";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var editor_module_css_default = {
			"appearanceChip": "VX-wEW_appearanceChip",
			"appearanceChipActive": "VX-wEW_appearanceChipActive",
			"appearanceColorRow": "VX-wEW_appearanceColorRow",
			"appearanceColorSwatch": "VX-wEW_appearanceColorSwatch",
			"appearanceFontRow": "VX-wEW_appearanceFontRow",
			"appearanceFontValue": "VX-wEW_appearanceFontValue",
			"appearanceHexInput": "VX-wEW_appearanceHexInput",
			"appearanceHexInvalid": "VX-wEW_appearanceHexInvalid",
			"appearanceHint": "VX-wEW_appearanceHint",
			"appearanceLabel": "VX-wEW_appearanceLabel",
			"appearanceMenu": "VX-wEW_appearanceMenu",
			"appearanceSaveScheme": "VX-wEW_appearanceSaveScheme",
			"appearanceSchemeApply": "VX-wEW_appearanceSchemeApply",
			"appearanceSchemeApplyActive": "VX-wEW_appearanceSchemeApplyActive",
			"appearanceSchemeItem": "VX-wEW_appearanceSchemeItem",
			"appearanceSchemeList": "VX-wEW_appearanceSchemeList",
			"appearanceSchemeMeta": "VX-wEW_appearanceSchemeMeta",
			"appearanceSchemeRemove": "VX-wEW_appearanceSchemeRemove",
			"appearanceSchemeSwatch": "VX-wEW_appearanceSchemeSwatch",
			"appearanceSection": "VX-wEW_appearanceSection",
			"appearanceStep": "VX-wEW_appearanceStep",
			"appearanceThemeRow": "VX-wEW_appearanceThemeRow",
			"body": "VX-wEW_body",
			"closeBtn": "VX-wEW_closeBtn",
			"dirtyMark": "VX-wEW_dirtyMark",
			"empty": "VX-wEW_empty",
			"errorBanner": "VX-wEW_errorBanner",
			"monacoHost": "VX-wEW_monacoHost",
			"pathBar": "VX-wEW_pathBar",
			"preview": "VX-wEW_preview",
			"status": "VX-wEW_status",
			"surface": "VX-wEW_surface",
			"tab": "VX-wEW_tab",
			"tabActive": "VX-wEW_tabActive",
			"tabs": "VX-wEW_tabs",
			"textarea": "VX-wEW_textarea",
			"toolBtn": "VX-wEW_toolBtn",
			"toolBtnActive": "VX-wEW_toolBtnActive",
			"toolbar": "VX-wEW_toolbar",
			"toolbarEnd": "VX-wEW_toolbarEnd"
		};
		//#endregion
		//#region lib/types/client/editor/AppearanceMenu.js
		/**
		* Popover for Monaco theme + custom hex background + font size + saved schemes.
		*/
		const THEME_OPTIONS = [
			{
				id: "vs-dark",
				labelKey: "editorThemeDark"
			},
			{
				id: "vs",
				labelKey: "editorThemeLight"
			},
			{
				id: "hc-black",
				labelKey: "editorThemeHighContrast"
			}
		];
		/**
		* Floating panel: preset themes, custom HTML hex, font size, saved schemes.
		*/
		function AppearanceMenu(props) {
			const { t, appearance, store, onClose, hasImportedTheme } = props;
			const rootRef = (0, react.useRef)(null);
			const [hexDraft, setHexDraft] = (0, react.useState)(appearance.customBackground ?? hexForColorInput(null, appearance.theme));
			const [hexInvalid, setHexInvalid] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setHexDraft(appearance.customBackground ?? hexForColorInput(null, appearance.theme));
				setHexInvalid(false);
			}, [appearance.customBackground, appearance.theme]);
			(0, react.useEffect)(() => {
				const onPointer = (event) => {
					const root = rootRef.current;
					if (root !== null && root.contains(event.target)) return;
					onClose();
				};
				const onKey = (event) => {
					if (event.key === "Escape") onClose();
				};
				const timer = window.setTimeout(() => {
					document.addEventListener("mousedown", onPointer, true);
					document.addEventListener("keydown", onKey, true);
				}, 0);
				return () => {
					window.clearTimeout(timer);
					document.removeEventListener("mousedown", onPointer, true);
					document.removeEventListener("keydown", onKey, true);
				};
			}, [onClose]);
			const commitHex = (raw) => {
				const normalized = normalizeHexColor(raw);
				if (normalized === null) {
					setHexInvalid(true);
					return false;
				}
				setHexInvalid(false);
				setHexDraft(normalized);
				store.setCustomBackground(normalized);
				return true;
			};
			const saveCurrentScheme = () => {
				const draft = hexDraft.trim();
				if (draft !== "") {
					const normalized = normalizeHexColor(draft);
					if (normalized === null) {
						setHexInvalid(true);
						return;
					}
					setHexInvalid(false);
					setHexDraft(normalized);
					store.setCustomBackground(normalized);
					store.saveScheme(normalized);
					return;
				}
				store.saveScheme();
			};
			const pickerValue = hexForColorInput(normalizeHexColor(hexDraft) ?? appearance.customBackground, appearance.theme);
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: editor_module_css_default.appearanceMenu,
				role: "dialog",
				"aria-label": t("editorAppearance"),
				"data-file-explorer-appearance": "",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceLabel,
							children: t("editorTheme")
						}), (0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceThemeRow,
							role: "radiogroup",
							"aria-label": t("editorTheme"),
							children: (hasImportedTheme ? [
								...THEME_OPTIONS,
								{
									id: VSCODE_THEME_ID,
									labelKey: "editorThemeVscode"
								}
							] : THEME_OPTIONS).map((option) => (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "radio",
								"aria-checked": appearance.customBackground === null && appearance.theme === option.id,
								className: appearance.customBackground === null && appearance.theme === option.id ? `${editor_module_css_default.appearanceChip} ${editor_module_css_default.appearanceChipActive}` : editor_module_css_default.appearanceChip,
								onClick: () => store.setTheme(option.id),
								children: t(option.labelKey)
							}, option.id))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceLabel,
								children: t("editorCustomColor")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: editor_module_css_default.appearanceColorRow,
								children: [
									(0, react_jsx_runtime.jsx)("input", {
										type: "color",
										className: editor_module_css_default.appearanceColorSwatch,
										value: pickerValue,
										"aria-label": t("editorCustomColor"),
										onChange: (event) => {
											commitHex(event.target.value);
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "text",
										className: hexInvalid ? `${editor_module_css_default.appearanceHexInput} ${editor_module_css_default.appearanceHexInvalid}` : editor_module_css_default.appearanceHexInput,
										value: hexDraft,
										spellCheck: false,
										placeholder: "#1e1e1e",
										"aria-invalid": hexInvalid,
										"aria-label": t("editorCustomColor"),
										onChange: (event) => {
											setHexDraft(event.target.value);
											setHexInvalid(false);
										},
										onBlur: () => {
											if (hexDraft.trim() === "") {
												store.setCustomBackground(null);
												setHexDraft(hexForColorInput(null, appearance.theme));
												setHexInvalid(false);
												return;
											}
											commitHex(hexDraft);
										},
										onKeyDown: (event) => {
											if (event.key === "Enter") {
												event.preventDefault();
												commitHex(hexDraft);
											}
										}
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: editor_module_css_default.appearanceStep,
										disabled: appearance.customBackground === null,
										onClick: () => {
											store.setCustomBackground(null);
											setHexDraft(hexForColorInput(null, appearance.theme));
											setHexInvalid(false);
										},
										children: t("editorCustomColorClear")
									})
								]
							}),
							hexInvalid ? (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorCustomColorInvalid")
							}) : (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorCustomColorHint")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.appearanceLabel,
							children: t("editorFontSize")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: editor_module_css_default.appearanceFontRow,
							children: [
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: editor_module_css_default.appearanceStep,
									"aria-label": t("editorFontSmaller"),
									disabled: appearance.fontSize <= 11,
									onClick: () => store.bumpFont(-1),
									children: "A−"
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: editor_module_css_default.appearanceFontValue,
									children: [appearance.fontSize, "px"]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: editor_module_css_default.appearanceStep,
									"aria-label": t("editorFontLarger"),
									disabled: appearance.fontSize >= 24,
									onClick: () => store.bumpFont(1),
									children: "A+"
								})
							]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: appearance.minimap === true ? `${editor_module_css_default.appearanceChip} ${editor_module_css_default.appearanceChipActive}` : editor_module_css_default.appearanceChip,
							"aria-pressed": appearance.minimap === true,
							onClick: () => store.setMinimap(!(appearance.minimap === true)),
							children: t("editorMinimap")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.appearanceSection,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceLabel,
								children: t("editorScheme")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.appearanceSaveScheme,
								onClick: saveCurrentScheme,
								children: t("editorSchemeSave")
							}),
							appearance.schemes.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
								className: editor_module_css_default.appearanceHint,
								children: t("editorSchemeEmpty")
							}) : (0, react_jsx_runtime.jsx)("ul", {
								className: editor_module_css_default.appearanceSchemeList,
								"aria-label": t("editorScheme"),
								children: appearance.schemes.map((scheme) => {
									const active = appearance.customBackground === scheme.background && appearance.fontSize === scheme.fontSize;
									return (0, react_jsx_runtime.jsxs)("li", {
										className: editor_module_css_default.appearanceSchemeItem,
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: active ? `${editor_module_css_default.appearanceSchemeApply} ${editor_module_css_default.appearanceSchemeApplyActive}` : editor_module_css_default.appearanceSchemeApply,
											onClick: () => store.applyScheme(scheme.id),
											children: [(0, react_jsx_runtime.jsx)("span", {
												className: editor_module_css_default.appearanceSchemeSwatch,
												style: { background: scheme.background },
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsxs)("span", {
												className: editor_module_css_default.appearanceSchemeMeta,
												children: [
													scheme.background,
													" · ",
													scheme.fontSize,
													"px"
												]
											})]
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: editor_module_css_default.appearanceSchemeRemove,
											"aria-label": t("editorSchemeRemove"),
											onClick: () => store.removeScheme(scheme.id),
											children: "×"
										})]
									}, scheme.id);
								})
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/editor/TabStrip.js
		/**
		* Tab strip for open editor buffers, with close + context-menu actions.
		*/
		/**
		* Horizontal list of open paths with dirty marks, close buttons, and
		* right-click: close / close to the right / close all.
		*/
		function TabStrip(props) {
			const { tabs, activePath, buffers, t, onActivate, onClose, onClosePaths } = props;
			const [menu, setMenu] = (0, react.useState)(null);
			const stripRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				stripRef.current?.querySelector('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
			}, [activePath]);
			const closeMenu = (0, react.useCallback)(() => {
				setMenu(null);
			}, []);
			const menuItems = menu === null ? [] : (() => {
				const index = tabs.findIndex((tab) => tab.path === menu.path);
				const toRight = index >= 0 ? tabs.slice(index + 1).map((tab) => tab.path) : [];
				return [
					{
						id: "close",
						label: t("tabClose"),
						onSelect: () => {
							onClose(menu.path);
						}
					},
					{
						id: "close-right",
						label: t("tabCloseRight"),
						disabled: toRight.length === 0,
						onSelect: () => {
							if (toRight.length === 0) return;
							onClosePaths(toRight);
						}
					},
					{
						id: "close-all",
						label: t("tabCloseAll"),
						onSelect: () => {
							onClosePaths(tabs.map((tab) => tab.path));
						}
					}
				];
			})();
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: stripRef,
				className: editor_module_css_default.tabs,
				role: "tablist",
				children: [tabs.map((tab) => {
					const active = tab.path === activePath;
					const dirty = buffers.isDirty(tab.path);
					const sameName = tabs.some((other) => other.path !== tab.path && other.title === tab.title);
					const parent = tab.path.replaceAll("\\", "/").split("/").slice(-2, -1)[0] ?? "";
					return (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": active,
						"aria-label": tab.path,
						title: tab.path,
						"data-file-explorer-tab-path": tab.path,
						className: active ? `${editor_module_css_default.tab} ${editor_module_css_default.tabActive}` : editor_module_css_default.tab,
						onClick: () => onActivate(tab.path),
						onAuxClick: (event) => {
							if (event.button === 1) {
								event.preventDefault();
								onClose(tab.path);
							}
						},
						onContextMenu: (event) => {
							event.preventDefault();
							event.stopPropagation();
							onActivate(tab.path);
							setMenu({
								x: event.clientX,
								y: event.clientY,
								path: tab.path
							});
						},
						children: [(0, react_jsx_runtime.jsx)(FileIcon, { name: tab.title }), (0, react_jsx_runtime.jsxs)("span", { className: "vscodeTabLabel", children: [tab.title, sameName && parent !== "" ? (0, react_jsx_runtime.jsx)("span", { className: "vscodeTabContext", children: parent }) : null, dirty ? (0, react_jsx_runtime.jsx)("span", {
							className: editor_module_css_default.dirtyMark,
							children: " •"
						}) : null] }), (0, react_jsx_runtime.jsx)("span", {
							className: editor_module_css_default.closeBtn,
							role: "button",
							tabIndex: 0,
							"aria-label": t("tabClose"),
							onClick: (event) => {
								event.stopPropagation();
								onClose(tab.path);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									event.stopPropagation();
									onClose(tab.path);
								}
							},
							children: "×"
						})]
					}, tab.path);
				}), menu !== null ? (0, react_jsx_runtime.jsx)(ExplorerContextMenu, {
					x: menu.x,
					y: menu.y,
					items: menuItems,
					onClose: closeMenu
				}) : null]
			});
		}
		//#endregion
		//#region ../../../node_modules/.pnpm/marked@18.0.11/node_modules/marked/lib/marked.esm.js
		/**
		* marked v18.0.11 - a markdown parser
		* Copyright (c) 2018-2026, MarkedJS. (MIT License)
		* Copyright (c) 2011-2018, Christopher Jeffrey. (MIT License)
		* https://github.com/markedjs/marked
		*/
		/**
		* DO NOT EDIT THIS FILE
		* The code in this file is generated from files in ./src/
		*/
		function A() {
			return {
				async: !1,
				breaks: !1,
				extensions: null,
				gfm: !0,
				hooks: null,
				pedantic: !1,
				renderer: null,
				silent: !1,
				tokenizer: null,
				walkTokens: null
			};
		}
		var R = A();
		function j(l) {
			R = l;
		}
		var z = { exec: () => null };
		function I(l) {
			let e = [];
			return (t) => {
				let n = Math.max(0, Math.min(3, t - 1)), s = e[n];
				return s || (s = l(n), e[n] = s), s;
			};
		}
		function k(l, e = "") {
			let t = typeof l == "string" ? l : l.source, n = {
				replace: (s, r) => {
					let i = typeof r == "string" ? r : r.source;
					return i = i.replace(m.caret, "$1"), t = t.replace(s, i), n;
				},
				getRegex: () => new RegExp(t, e)
			};
			return n;
		}
		var Oe = ((l = "") => {
			try {
				return !!new RegExp("(?<=1)(?<!1)" + l);
			} catch {
				return !1;
			}
		})();
		var m = {
			codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
			outputLinkReplace: /\\([\[\]])/g,
			indentCodeCompensation: /^(\s+)(?:```)/,
			beginningSpace: /^\s+/,
			endingHash: /#$/,
			startingSpaceChar: /^ /,
			endingSpaceChar: / $/,
			nonSpaceChar: /[^ ]/,
			newLineCharGlobal: /\n/g,
			tabCharGlobal: /\t/g,
			multipleSpaceGlobal: /\s+/g,
			blankLine: /^[ \t]*$/,
			doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
			blockquoteStart: /^ {0,3}>/,
			blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
			blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
			listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
			listIsTask: /^\[[ xX]\] +\S/,
			listReplaceTask: /^\[[ xX]\] +/,
			listTaskCheckbox: /\[[ xX]\]/,
			anyLine: /\n.*\n/,
			hrefBrackets: /^<(.*)>$/,
			tableDelimiter: /[:|]/,
			tableAlignChars: /^\||\| *$/g,
			tableRowBlankLine: /\n[ \t]*$/,
			tableAlignRight: /^ *-+: *$/,
			tableAlignCenter: /^ *:-+: *$/,
			tableAlignLeft: /^ *:-+ *$/,
			startATag: /^<a /i,
			endATag: /^<\/a>/i,
			startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
			endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
			startAngleBracket: /^</,
			endAngleBracket: />$/,
			pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
			unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
			escapeTest: /[&<>"']/,
			escapeReplace: /[&<>"']/g,
			escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
			escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
			caret: /(^|[^\[])\^/g,
			percentDecode: /%25/g,
			findPipe: /\|/g,
			splitPipe: / \|/,
			slashPipe: /\\\|/g,
			carriageReturn: /\r\n|\r/g,
			spaceLine: /^ +$/gm,
			notSpaceStart: /^\S*/,
			endingNewline: /\n$/,
			listItemRegex: (l) => new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`),
			nextBulletRegex: I((l) => new RegExp(`^ {0,${l}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`)),
			hrRegex: I((l) => new RegExp(`^ {0,${l}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),
			fencesBeginRegex: I((l) => new RegExp(`^ {0,${l}}(?:\`\`\`|~~~)`)),
			headingBeginRegex: I((l) => new RegExp(`^ {0,${l}}#`)),
			htmlBeginRegex: I((l) => new RegExp(`^ {0,${l}}<(?:[a-z].*>|!--)`, "i")),
			blockquoteBeginRegex: I((l) => new RegExp(`^ {0,${l}}>`))
		};
		var Te = /^(?:[ \t]*(?:\n|$))+/;
		var we = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/;
		var ye = /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/;
		var q = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/;
		var Pe = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/;
		var U = / {0,3}(?:[*+-]|\d{1,9}[.)])/;
		var oe = /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/;
		var ae = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/\|table/g, "").getRegex();
		var Se = k(oe).replace(/bull/g, U).replace(/blockCode/g, /(?: {4}| {0,3}\t)/).replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g, / {0,3}>/).replace(/heading/g, / {0,3}#{1,6}(?:\s|$)/).replace(/html/g, / {0,3}<[^\n>]+>\n/).replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex();
		var K = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table|[ \t]+\n)[^\n]+)*)/;
		var _e = /^[^\n]+/;
		var W = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/;
		var $e = k(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label", W).replace("title", /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex();
		var Le = k(/^(bull)([ \t][^\n]*?)?(?:\n|$)/).replace(/bull/g, U).getRegex();
		var Q = "address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";
		var X = /<!--(?:-?>|[\s\S]*?(?:-->|$))/;
		var Ee = k("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n*|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>[^\\n]*\\n*|$)|<![A-Z][\\s\\S]*?(?:>[^\\n]*\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>[^\\n]*\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))", "i").replace("comment", X).replace("tag", Q).replace("attribute", / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
		var le = (l) => k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("|table", "").replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", l).replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex();
		var ze = le(/ {0,3}(?:[*+-]|1[.)])[ \t]+[^ \t\n]/);
		var Me = le(/ {0,3}(?:[*+-]|\d{1,9}[.)])(?:[ \t]|\n|$)/);
		var J = {
			blockquote: k(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph", Me).getRegex(),
			code: we,
			def: $e,
			fences: ye,
			heading: Pe,
			hr: q,
			html: Ee,
			lheading: ae,
			list: Le,
			newline: Te,
			paragraph: ze,
			table: z,
			text: _e
		};
		var se = k("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("blockquote", " {0,3}>").replace("code", "(?: {4}| {0,3}	)[^\\n]").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex();
		var Ie = {
			...J,
			lheading: Se,
			table: se,
			paragraph: k(K).replace("hr", q).replace("heading", " {0,3}#{1,6}(?:\\s|$)").replace("|lheading", "").replace("table", se).replace("blockquote", " {0,3}>").replace("fences", " {0,3}(?:`{3,}(?=[^`\\n]*(?:\\n|$))|~~~)[^\\n]*(?:\\n|$)").replace("list", " {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]").replace("html", "</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag", Q).getRegex()
		};
		var Ce = {
			...J,
			html: k(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment", X).replace(/tag/g, "(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),
			def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
			heading: /^(#{1,6})(.*)(?:\n+|$)/,
			fences: z,
			lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
			paragraph: k(K).replace("hr", q).replace("heading", ` *#{1,6} *[^
]`).replace("lheading", ae).replace("|table", "").replace("blockquote", " {0,3}>").replace("|fences", "").replace("|list", "").replace("|html", "").replace("|tag", "").getRegex()
		};
		var Be = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/;
		var De = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/;
		var ue = /^( {2,}|\\)\n(?!\s*$)/;
		var qe = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/;
		var _ = /[\p{P}\p{S}]/u;
		var C = /[\s\p{P}\p{S}]/u;
		var v = /[^\s\p{P}\p{S}]/u;
		var ve = k(/^((?![*_])punctSpace)/, "u").replace(/punctSpace/g, C).getRegex();
		var He = /[\p{Pi}\p{Ps}"']/u;
		var pe = /(?!~)[\p{P}\p{S}]/u;
		var Ze = /(?!~)[\s\p{P}\p{S}]/u;
		var Ge = /(?:[^\s\p{P}\p{S}]|~)/u;
		var Qe = k(/link|precode-code|html/, "g").replace("link", /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-", Oe ? "(?<!`)()" : "(^^|[^`])").replace("code", /(?<b>`+)[^`]+\k<b>(?!`)/).replace("html", /<(?! )[^<>]*?>/).getRegex();
		var ce = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/;
		var Ne = k(ce, "u").replace(/punct/g, _).getRegex();
		var je = k(ce, "u").replace(/punct/g, pe).getRegex();
		var Ue = k(/^(?:\*+(?:((?!\*)(?!openQuote)punct)|([^\s*]))?)|^_+(?:((?!_)(?!openQuote)punct)|([^\s_]))?/, "u").replace(/openQuote/g, He).replace(/punct/g, _).getRegex();
		var he = "^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)";
		var Ke = k(he, "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
		var We = k(he, "gu").replace(/notPunctSpace/g, Ge).replace(/punctSpace/g, Ze).replace(/punct/g, pe).getRegex();
		var Je = k("^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)[\\s](\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|(?:(?!\\*)punct|notPunctSpace)(\\*+)(?!\\*)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
		var Ve = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
		var et = k("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)[\\s](_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)|(?:(?!_)punct|notPunctSpace)(_+)(?!_)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
		var tt = k(/^~~?(?:((?!~)punct)|[^\s~])/, "u").replace(/punct/g, _).getRegex();
		var rt = k("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)", "gu").replace(/notPunctSpace/g, v).replace(/punctSpace/g, C).replace(/punct/g, _).getRegex();
		var st = k(/\\(punct)/, "gu").replace(/punct/g, _).getRegex();
		var it = k(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme", /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email", /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex();
		var ot = k(X).replace("(?:-->|$)", "-->").getRegex();
		var at = k("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment", ot).replace("attribute", /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex();
		var G = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/;
		var lt = k(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label", G).replace("href", /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]+|(?=\))/).replace("title", /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex();
		var ke = k(/^!?\[(label)\]\[(ref)\]/).replace("label", G).replace("ref", W).getRegex();
		var de = k(/^!?\[(ref)\](?:\[\])?/).replace("ref", W).getRegex();
		var ut = k("reflink|nolink(?!\\()", "g").replace("reflink", ke).replace("nolink", de).getRegex();
		var ie = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/;
		var V = {
			_backpedal: z,
			anyPunctuation: st,
			autolink: it,
			blockSkip: Qe,
			br: ue,
			code: De,
			del: z,
			delLDelim: z,
			delRDelim: z,
			emStrongLDelim: Ne,
			emStrongRDelimAst: Ke,
			emStrongRDelimUnd: Ve,
			escape: Be,
			link: lt,
			nolink: de,
			punctuation: ve,
			reflink: ke,
			reflinkSearch: ut,
			tag: at,
			text: qe,
			url: z
		};
		var pt = {
			...V,
			emStrongLDelim: Ue,
			emStrongRDelimAst: Je,
			emStrongRDelimUnd: et,
			link: k(/^!?\[(label)\]\((.*?)\)/).replace("label", G).getRegex(),
			reflink: k(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label", G).getRegex()
		};
		var F = {
			...V,
			emStrongRDelimAst: We,
			emStrongLDelim: je,
			delLDelim: tt,
			delRDelim: rt,
			url: k(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol", ie).replace("email", /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),
			_backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
			del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
			text: k(/^(`+|~+|[^`~])(?:(?=[`~])|(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol", ie).getRegex()
		};
		var ct = {
			...F,
			br: k(ue).replace("{2,}", "*").getRegex(),
			text: k(F.text).replace("\\b_", "\\b_| {2,}\\n").replace(/\{2,\}/g, "*").getRegex()
		};
		var H = {
			normal: J,
			gfm: Ie,
			pedantic: Ce
		};
		var B = {
			normal: V,
			gfm: F,
			breaks: ct,
			pedantic: pt
		};
		var ht = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#39;"
		};
		var ge = (l) => ht[l];
		function T(l, e) {
			if (e) {
				if (m.escapeTest.test(l)) return l.replace(m.escapeReplace, ge);
			} else if (m.escapeTestNoEncode.test(l)) return l.replace(m.escapeReplaceNoEncode, ge);
			return l;
		}
		function Y(l) {
			try {
				l = encodeURI(l).replace(m.percentDecode, "%");
			} catch {
				return null;
			}
			return l;
		}
		function ee(l, e) {
			let n = l.replace(m.findPipe, (r, i, o) => {
				let u = !1, a = i;
				for (; --a >= 0 && o[a] === "\\";) u = !u;
				return u ? "|" : " |";
			}).split(m.splitPipe), s = 0;
			if (n[0].trim() || n.shift(), n.length > 0 && !n.at(-1)?.trim() && n.pop(), e) if (n.length > e) n.splice(e);
			else for (; n.length < e;) n.push("");
			for (; s < n.length; s++) n[s] = n[s].trim().replace(m.slashPipe, "|");
			return n;
		}
		function $(l, e, t) {
			let n = l.length;
			if (n === 0) return "";
			let s = 0;
			for (; s < n;) {
				let r = l.charAt(n - s - 1);
				if (r === e && !t) s++;
				else if (r !== e && t) s++;
				else break;
			}
			return l.slice(0, n - s);
		}
		function te(l) {
			let e = l.split(`
`), t = e.length - 1;
			for (; t >= 0 && m.blankLine.test(e[t]);) t--;
			return e.length - t <= 2 ? l : e.slice(0, t + 1).join(`
`);
		}
		function fe(l, e) {
			if (l.indexOf(e[1]) === -1) return -1;
			let t = 0;
			for (let n = 0; n < l.length; n++) if (l[n] === "\\") n++;
			else if (l[n] === e[0]) t++;
			else if (l[n] === e[1] && (t--, t < 0)) return n;
			return t > 0 ? -2 : -1;
		}
		function me(l, e = 0) {
			let t = e, n = "";
			for (let s of l) if (s === "	") {
				let r = 4 - t % 4;
				n += " ".repeat(r), t += r;
			} else n += s, t++;
			return n;
		}
		function xe(l, e, t, n, s) {
			let r = e.href, i = e.title || null, o = l[1].replace(s.other.outputLinkReplace, "$1"), u = l[0].charAt(0) === "!";
			n.state.inLink = !0;
			let a = n.state.linkEmitted, p = n.state.inRawBlock;
			n.state.linkEmitted = !1;
			let c = n.inlineTokens(o), h = n.state.linkEmitted;
			if (n.state.linkEmitted = a, n.state.inLink = !1, !u) {
				if (h) {
					n.state.inRawBlock = p;
					return;
				}
				n.state.linkEmitted = !0;
			}
			return {
				type: u ? "image" : "link",
				raw: t,
				href: r,
				title: i,
				text: o,
				tokens: c
			};
		}
		function kt(l, e, t) {
			let n = l.match(t.other.indentCodeCompensation);
			if (n === null) return e;
			let s = n[1];
			return e.split(`
`).map((r) => {
				let i = r.match(t.other.beginningSpace);
				if (i === null) return r;
				let [o] = i;
				return o.length >= s.length ? r.slice(s.length) : r;
			}).join(`
`);
		}
		var y = class {
			options;
			rules;
			lexer;
			constructor(e) {
				this.options = e || R;
			}
			space(e) {
				let t = this.rules.block.newline.exec(e);
				if (t && t[0].length > 0) return {
					type: "space",
					raw: t[0]
				};
			}
			code(e) {
				let t = this.rules.block.code.exec(e);
				if (t) {
					let n = this.options.pedantic ? t[0] : te(t[0]);
					return {
						type: "code",
						raw: n,
						codeBlockStyle: "indented",
						text: n.replace(this.rules.other.codeRemoveIndent, "")
					};
				}
			}
			fences(e) {
				let t = this.rules.block.fences.exec(e);
				if (t) {
					let n = t[0], s = kt(n, t[3] || "", this.rules);
					return {
						type: "code",
						raw: n,
						lang: t[2] ? t[2].trim().replace(this.rules.inline.anyPunctuation, "$1") : t[2],
						text: s
					};
				}
			}
			heading(e) {
				let t = this.rules.block.heading.exec(e);
				if (t) {
					let n = t[2].trim();
					if (this.rules.other.endingHash.test(n)) {
						let s = $(n, "#");
						(this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) && (n = s.trim());
					}
					return {
						type: "heading",
						raw: $(t[0], `
`),
						depth: t[1].length,
						text: n,
						tokens: this.lexer.inline(n)
					};
				}
			}
			hr(e) {
				let t = this.rules.block.hr.exec(e);
				if (t) return {
					type: "hr",
					raw: $(t[0], `
`)
				};
			}
			blockquote(e) {
				let t = this.rules.block.blockquote.exec(e);
				if (t) {
					let n = $(t[0], `
`).split(`
`), s = "", r = "", i = [];
					for (; n.length > 0;) {
						let o = !1, u = [], a;
						for (a = 0; a < n.length; a++) if (this.rules.other.blockquoteStart.test(n[a])) u.push(n[a]), o = !0;
						else if (!o) u.push(n[a]);
						else break;
						n = n.slice(a);
						let p = u.join(`
`), c = p.replace(this.rules.other.blockquoteSetextReplace, `
    $1`).replace(this.rules.other.blockquoteSetextReplace2, "");
						s = s ? `${s}
${p}` : p, r = r ? `${r}
${c}` : c;
						let h = this.lexer.state.top;
						if (this.lexer.state.top = !0, this.lexer.blockTokens(c, i, !0), this.lexer.state.top = h, n.length === 0) break;
						let d = i.at(-1);
						if (d?.type === "code") break;
						if (d?.type === "blockquote") {
							let O = d, g = n.join(`
`), w = O.raw + `
` + g.replace(this.rules.other.blockquoteSetextReplace2, ""), E = this.blockquote(w);
							i[i.length - 1] = E, s = `${s}
${g}`, r = r.substring(0, r.length - O.text.length) + E.text;
							break;
						} else if (d?.type === "list") {
							let O = d, g = O.raw + `
` + n.join(`
`), w = this.list(g);
							i[i.length - 1] = w, s = s.substring(0, s.length - d.raw.length) + w.raw, r = r.substring(0, r.length - O.raw.length) + w.raw, n = g.substring(i.at(-1).raw.length).split(`
`);
							continue;
						}
					}
					return {
						type: "blockquote",
						raw: s,
						tokens: i,
						text: r
					};
				}
			}
			list(e) {
				let t = this.rules.block.list.exec(e);
				if (t) {
					let n = t[1].trim(), s = n.length > 1, r = {
						type: "list",
						raw: "",
						ordered: s,
						start: s ? +n.slice(0, -1) : "",
						loose: !1,
						items: []
					};
					n = s ? `\\d{1,9}\\${n.slice(-1)}` : `\\${n}`, this.options.pedantic && (n = s ? n : "[*+-]");
					let i = this.rules.other.listItemRegex(n), o = !1;
					for (; e;) {
						let a = !1, p = "", c = "";
						if (!(t = i.exec(e)) || this.rules.block.hr.test(e)) break;
						p = t[0], e = e.substring(p.length);
						let h = me(t[2].split(`
`, 1)[0], t[1].length), d = e.split(`
`, 1)[0], O = !h.trim(), g = 0;
						if (this.options.pedantic ? (g = 2, c = h.trimStart()) : O ? g = t[1].length + 1 : (g = h.search(this.rules.other.nonSpaceChar), g = g > 4 ? 1 : g, c = h.slice(g), g += t[1].length), O && this.rules.other.blankLine.test(d) && (p += d + `
`, e = e.substring(d.length + 1), a = !0), !a) {
							let w = this.rules.other.nextBulletRegex(g), E = this.rules.other.hrRegex(g), ne = this.rules.other.fencesBeginRegex(g), re = this.rules.other.headingBeginRegex(g), be = this.rules.other.htmlBeginRegex(g), Re = this.rules.other.blockquoteBeginRegex(g);
							for (; e;) {
								let N = e.split(`
`, 1)[0], D;
								if (d = N, this.options.pedantic ? (d = d.replace(this.rules.other.listReplaceNesting, "  "), D = d) : D = d.replace(this.rules.other.tabCharGlobal, "    "), ne.test(d) || re.test(d) || be.test(d) || Re.test(d) || w.test(d) || E.test(d)) break;
								if (D.search(this.rules.other.nonSpaceChar) >= g || !d.trim()) c += `
` + D.slice(g);
								else {
									if (O || h.replace(this.rules.other.tabCharGlobal, "    ").search(this.rules.other.nonSpaceChar) >= 4 || ne.test(h) || re.test(h) || E.test(h)) break;
									c += `
` + d;
								}
								O = !d.trim(), p += N + `
`, e = e.substring(N.length + 1), h = D.slice(g);
							}
						}
						r.loose || (o ? r.loose = !0 : this.rules.other.doubleBlankLine.test(p) && (o = !0)), r.items.push({
							type: "list_item",
							raw: p,
							task: !!this.options.gfm && this.rules.other.listIsTask.test(c),
							loose: !1,
							text: c,
							tokens: []
						}), r.raw += p;
					}
					let u = r.items.at(-1);
					if (u) u.raw = u.raw.trimEnd(), u.text = u.text.trimEnd();
					else return;
					r.raw = r.raw.trimEnd();
					for (let a of r.items) if (this.lexer.state.top = !1, a.tokens = this.lexer.blockTokens(a.text, []), !r.loose) {
						let p = a.tokens.filter((h) => h.type === "space");
						r.loose = p.length > 0 && p.some((h) => this.rules.other.anyLine.test(h.raw));
					}
					for (let a of r.items) {
						let p = a.tokens[0];
						if (a.task && (p?.type === "text" || p?.type === "paragraph")) {
							a.text = a.text.replace(this.rules.other.listReplaceTask, ""), p.raw = p.raw.replace(this.rules.other.listReplaceTask, ""), p.text = p.text.replace(this.rules.other.listReplaceTask, "");
							for (let h = this.lexer.inlineQueue.length - 1; h >= 0; h--) if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[h].src)) {
								this.lexer.inlineQueue[h].src = this.lexer.inlineQueue[h].src.replace(this.rules.other.listReplaceTask, "");
								break;
							}
							let c = this.rules.other.listTaskCheckbox.exec(a.raw);
							if (c) {
								let h = {
									type: "checkbox",
									raw: c[0] + " ",
									checked: c[0] !== "[ ]"
								};
								a.checked = h.checked, r.loose ? a.tokens[0] && ["paragraph", "text"].includes(a.tokens[0].type) && "tokens" in a.tokens[0] && a.tokens[0].tokens ? (a.tokens[0].raw = h.raw + a.tokens[0].raw, a.tokens[0].text = h.raw + a.tokens[0].text, a.tokens[0].tokens.unshift(h)) : a.tokens.unshift({
									type: "paragraph",
									raw: h.raw,
									text: h.raw,
									tokens: [h]
								}) : a.tokens.unshift(h);
							}
						} else a.task && (a.task = !1);
					}
					if (r.loose) for (let a of r.items) {
						a.loose = !0;
						for (let p of a.tokens) p.type === "text" && (p.type = "paragraph");
					}
					return r;
				}
			}
			html(e) {
				let t = this.rules.block.html.exec(e);
				if (t) {
					let n = te(t[0]);
					return {
						type: "html",
						block: !0,
						raw: n,
						pre: t[1] === "pre" || t[1] === "script" || t[1] === "style",
						text: n
					};
				}
			}
			def(e) {
				let t = this.rules.block.def.exec(e);
				if (t) {
					let n = t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, " "), s = t[2] ? t[2].replace(this.rules.other.hrefBrackets, "$1").replace(this.rules.inline.anyPunctuation, "$1") : "", r = t[3] ? t[3].substring(1, t[3].length - 1).replace(this.rules.inline.anyPunctuation, "$1") : t[3];
					return {
						type: "def",
						tag: n,
						raw: $(t[0], `
`),
						href: s,
						title: r
					};
				}
			}
			table(e) {
				let t = this.rules.block.table.exec(e);
				if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
				let n = ee(t[1]), s = t[2].replace(this.rules.other.tableAlignChars, "").split("|"), r = t[3]?.trim() ? t[3].replace(this.rules.other.tableRowBlankLine, "").split(`
`) : [], i = {
					type: "table",
					raw: $(t[0], `
`),
					header: [],
					align: [],
					rows: []
				};
				if (n.length === s.length) {
					for (let o of s) this.rules.other.tableAlignRight.test(o) ? i.align.push("right") : this.rules.other.tableAlignCenter.test(o) ? i.align.push("center") : this.rules.other.tableAlignLeft.test(o) ? i.align.push("left") : i.align.push(null);
					for (let o = 0; o < n.length; o++) i.header.push({
						text: n[o],
						tokens: this.lexer.inline(n[o]),
						header: !0,
						align: i.align[o]
					});
					for (let o of r) i.rows.push(ee(o, i.header.length).map((u, a) => ({
						text: u,
						tokens: this.lexer.inline(u),
						header: !1,
						align: i.align[a]
					})));
					return i;
				}
			}
			lheading(e) {
				let t = this.rules.block.lheading.exec(e);
				if (t) {
					let n = t[1].trim();
					return {
						type: "heading",
						raw: $(t[0], `
`),
						depth: t[2].charAt(0) === "=" ? 1 : 2,
						text: n,
						tokens: this.lexer.inline(n)
					};
				}
			}
			paragraph(e) {
				let t = this.rules.block.paragraph.exec(e);
				if (t) {
					let n = t[1].charAt(t[1].length - 1) === `
` ? t[1].slice(0, -1) : t[1];
					return {
						type: "paragraph",
						raw: t[0],
						text: n,
						tokens: this.lexer.inline(n)
					};
				}
			}
			text(e) {
				let t = this.rules.block.text.exec(e);
				if (t) return {
					type: "text",
					raw: t[0],
					text: t[0],
					tokens: this.lexer.inline(t[0])
				};
			}
			escape(e) {
				let t = this.rules.inline.escape.exec(e);
				if (t) return {
					type: "escape",
					raw: t[0],
					text: t[1]
				};
			}
			tag(e) {
				let t = this.rules.inline.tag.exec(e);
				if (t) return !this.lexer.state.inLink && this.rules.other.startATag.test(t[0]) ? this.lexer.state.inLink = !0 : this.lexer.state.inLink && this.rules.other.endATag.test(t[0]) && (this.lexer.state.inLink = !1), !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(t[0]) ? this.lexer.state.inRawBlock = !0 : this.lexer.state.inRawBlock && this.rules.other.endPreScriptTag.test(t[0]) && (this.lexer.state.inRawBlock = !1), {
					type: "html",
					raw: t[0],
					inLink: this.lexer.state.inLink,
					inRawBlock: this.lexer.state.inRawBlock,
					block: !1,
					text: t[0]
				};
			}
			link(e) {
				let t = this.rules.inline.link.exec(e);
				if (t) {
					let n = t[2].trim();
					if (!this.options.pedantic && this.rules.other.startAngleBracket.test(n)) {
						if (!this.rules.other.endAngleBracket.test(n)) return;
						let i = $(n.slice(0, -1), "\\");
						if ((n.length - i.length) % 2 === 0) return;
					} else {
						let i = fe(t[2], "()");
						if (i === -2) return;
						if (i > -1) {
							let u = (t[0].indexOf("!") === 0 ? 5 : 4) + t[1].length + i;
							t[2] = t[2].substring(0, i), t[0] = t[0].substring(0, u).trim(), t[3] = "";
						}
					}
					let s = t[2], r = "";
					if (this.options.pedantic) {
						let i = this.rules.other.pedanticHrefTitle.exec(s);
						i && (s = i[1], r = i[3]);
					} else r = t[3] ? t[3].slice(1, -1) : "";
					return s = s.trim(), this.rules.other.startAngleBracket.test(s) && (this.options.pedantic && !this.rules.other.endAngleBracket.test(n) ? s = s.slice(1) : s = s.slice(1, -1)), xe(t, {
						href: s && s.replace(this.rules.inline.anyPunctuation, "$1"),
						title: r && r.replace(this.rules.inline.anyPunctuation, "$1")
					}, t[0], this.lexer, this.rules);
				}
			}
			reflink(e, t) {
				let n;
				if ((n = this.rules.inline.reflink.exec(e)) || (n = this.rules.inline.nolink.exec(e))) {
					let r = t[(n[2] || n[1]).replace(this.rules.other.multipleSpaceGlobal, " ").toLowerCase()];
					if (!r) {
						let i = n[0].charAt(0);
						return {
							type: "text",
							raw: i,
							text: i
						};
					}
					return xe(n, r, n[0], this.lexer, this.rules);
				}
			}
			emStrong(e, t, n = "") {
				let s = this.rules.inline.emStrongLDelim.exec(e);
				if (!s || !s[1] && !s[2] && !s[3] && !s[4] || s[4] && n.match(this.rules.other.unicodeAlphaNumeric)) return;
				if (!(s[1] || s[3] || "") || !n || this.rules.inline.punctuation.exec(n)) {
					let i = [...s[0]].length - 1, o, u, a = i, p = 0, c = s[0][0], h = n === c, d = c === "*" ? this.rules.inline.emStrongRDelimAst : this.rules.inline.emStrongRDelimUnd;
					for (d.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = d.exec(t)) !== null;) {
						if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o) continue;
						if (u = [...o].length, s[3] || s[4]) {
							a += u;
							continue;
						} else if (s[5] || s[6]) {
							if (i % 3 && !((i + u) % 3)) {
								p += u;
								continue;
							}
							if (h) break;
						}
						if (a -= u, a > 0) continue;
						u = Math.min(u, u + a + p);
						let O = [...s[0]][0].length, g = e.slice(0, i + s.index + O + u);
						if (Math.min(i, u) % 2) {
							let E = g.slice(1, -1);
							return {
								type: "em",
								raw: g,
								text: E,
								tokens: this.lexer.inlineTokens(E)
							};
						}
						let w = g.slice(2, -2);
						return {
							type: "strong",
							raw: g,
							text: w,
							tokens: this.lexer.inlineTokens(w)
						};
					}
				}
			}
			codespan(e) {
				let t = this.rules.inline.code.exec(e);
				if (t) {
					let n = t[2].replace(this.rules.other.newLineCharGlobal, " "), s = this.rules.other.nonSpaceChar.test(n), r = this.rules.other.startingSpaceChar.test(n) && this.rules.other.endingSpaceChar.test(n);
					return s && r && (n = n.substring(1, n.length - 1)), {
						type: "codespan",
						raw: t[0],
						text: n
					};
				}
			}
			br(e) {
				let t = this.rules.inline.br.exec(e);
				if (t) return {
					type: "br",
					raw: t[0]
				};
			}
			del(e, t, n = "") {
				let s = this.rules.inline.delLDelim.exec(e);
				if (!s) return;
				if (!(s[1] || "") || !n || this.rules.inline.punctuation.exec(n)) {
					let i = [...s[0]].length - 1, o, u, a = i, p = this.rules.inline.delRDelim;
					for (p.lastIndex = 0, t = t.slice(-1 * e.length + i); (s = p.exec(t)) !== null;) {
						if (o = s[1] || s[2] || s[3] || s[4] || s[5] || s[6], !o || (u = [...o].length, u !== i)) continue;
						if (s[3] || s[4]) {
							a += u;
							continue;
						}
						if (a -= u, a > 0) continue;
						u = Math.min(u, u + a);
						let c = [...s[0]][0].length, h = e.slice(0, i + s.index + c + u), d = h.slice(i, -i);
						return {
							type: "del",
							raw: h,
							text: d,
							tokens: this.lexer.inlineTokens(d)
						};
					}
				}
			}
			autolink(e) {
				let t = this.rules.inline.autolink.exec(e);
				if (t) {
					let n, s;
					return t[2] === "@" ? (n = t[1], s = "mailto:" + n) : (n = t[1], s = n), {
						type: "link",
						raw: t[0],
						text: n,
						href: s,
						tokens: [{
							type: "text",
							raw: n,
							text: n
						}]
					};
				}
			}
			url(e) {
				let t;
				if (t = this.rules.inline.url.exec(e)) {
					let n, s;
					if (t[2] === "@") n = t[0], s = "mailto:" + n;
					else {
						let r;
						do
							r = t[0], t[0] = this.rules.inline._backpedal.exec(t[0])?.[0] ?? "";
						while (r !== t[0]);
						n = t[0], t[1] === "www." ? s = "http://" + t[0] : s = t[0];
					}
					return {
						type: "link",
						raw: t[0],
						text: n,
						href: s,
						tokens: [{
							type: "text",
							raw: n,
							text: n
						}]
					};
				}
			}
			inlineText(e) {
				let t = this.rules.inline.text.exec(e);
				if (t) {
					let n = this.lexer.state.inRawBlock;
					return {
						type: "text",
						raw: t[0],
						text: t[0],
						escaped: n
					};
				}
			}
		};
		var x = class l {
			tokens;
			options;
			state;
			inlineQueue;
			tokenizer;
			constructor(e) {
				this.tokens = [], this.tokens.links = Object.create(null), this.options = e || R, this.options.tokenizer = this.options.tokenizer || new y(), this.tokenizer = this.options.tokenizer, this.tokenizer.options = this.options, this.tokenizer.lexer = this, this.inlineQueue = [], this.state = {
					inLink: !1,
					inRawBlock: !1,
					linkEmitted: !1,
					top: !0
				};
				let t = {
					other: m,
					block: H.normal,
					inline: B.normal
				};
				this.options.pedantic ? (t.block = H.pedantic, t.inline = B.pedantic) : this.options.gfm && (t.block = H.gfm, this.options.breaks ? t.inline = B.breaks : t.inline = B.gfm), this.tokenizer.rules = t;
			}
			static get rules() {
				return {
					block: H,
					inline: B
				};
			}
			static lex(e, t) {
				return new l(t).lex(e);
			}
			static lexInline(e, t) {
				return new l(t).inlineTokens(e);
			}
			lex(e) {
				e = e.replace(m.carriageReturn, `
`), this.blockTokens(e, this.tokens);
				for (let t = 0; t < this.inlineQueue.length; t++) {
					let n = this.inlineQueue[t];
					this.inlineTokens(n.src, n.tokens);
				}
				return this.inlineQueue = [], this.tokens;
			}
			blockTokens(e, t = [], n = !1) {
				this.tokenizer.lexer = this, this.options.pedantic && (e = e.replace(m.tabCharGlobal, "    ").replace(m.spaceLine, ""));
				let s = 1 / 0;
				for (; e;) {
					if (e.length < s) s = e.length;
					else {
						this.infiniteLoopError(e.charCodeAt(0));
						break;
					}
					let r;
					if (this.options.extensions?.block?.some((o) => (r = o.call({ lexer: this }, e, t)) ? (e = e.substring(r.raw.length), t.push(r), !0) : !1)) continue;
					if (r = this.tokenizer.space(e)) {
						e = e.substring(r.raw.length);
						let o = t.at(-1);
						r.raw.length === 1 && o !== void 0 ? o.raw += `
` : t.push(r);
						continue;
					}
					if (r = this.tokenizer.code(e)) {
						e = e.substring(r.raw.length);
						let o = t.at(-1);
						o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.at(-1).src = o.text) : t.push(r);
						continue;
					}
					if (r = this.tokenizer.fences(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.heading(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.hr(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.blockquote(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.list(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.html(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.def(e)) {
						e = e.substring(r.raw.length);
						let o = t.at(-1);
						o?.type === "paragraph" || o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.raw, this.inlineQueue.at(-1).src = o.text) : this.tokens.links[r.tag] || (this.tokens.links[r.tag] = {
							href: r.href,
							title: r.title
						}, t.push(r));
						continue;
					}
					if (r = this.tokenizer.table(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					if (r = this.tokenizer.lheading(e)) {
						e = e.substring(r.raw.length), t.push(r);
						continue;
					}
					let i = e;
					if (this.options.extensions?.startBlock) {
						let o = 1 / 0, u = e.slice(1), a;
						this.options.extensions.startBlock.forEach((p) => {
							a = p.call({ lexer: this }, u), typeof a == "number" && a >= 0 && (o = Math.min(o, a));
						}), o < 1 / 0 && o >= 0 && (i = e.substring(0, o + 1));
					}
					if (this.state.top && (r = this.tokenizer.paragraph(i))) {
						let o = t.at(-1);
						n && o?.type === "paragraph" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r), n = i.length !== e.length, e = e.substring(r.raw.length);
						continue;
					}
					if (r = this.tokenizer.text(e)) {
						e = e.substring(r.raw.length);
						let o = t.at(-1);
						o?.type === "text" ? (o.raw += (o.raw.endsWith(`
`) ? "" : `
`) + r.raw, o.text += `
` + r.text, this.inlineQueue.pop(), this.inlineQueue.at(-1).src = o.text) : t.push(r);
						continue;
					}
					if (e) {
						this.infiniteLoopError(e.charCodeAt(0));
						break;
					}
				}
				return this.state.top = !0, t;
			}
			inline(e, t = []) {
				return this.inlineQueue.push({
					src: e,
					tokens: t
				}), t;
			}
			linkInText(e) {
				if (!e.includes("[")) return !1;
				let t = this.tokenizer.rules.inline.link;
				for (let n of e.matchAll(this.tokenizer.rules.inline.blockSkip)) if (t.test(n[0]) && e.charAt(n.index - 1) !== "!") return !0;
				for (let n of e.matchAll(this.tokenizer.rules.inline.reflinkSearch)) {
					let s = n[0], r = s.lastIndexOf("[");
					if (!(s.charAt(0) === "!" || !Object.hasOwn(this.tokens.links, s.slice(r + 1, -1))) && !(r > 1 && this.linkInText(s.slice(1, r - 1)))) return !0;
				}
				return !1;
			}
			inlineTokens(e, t = []) {
				this.tokenizer.lexer = this;
				let n = e;
				if (this.tokens.links && e.includes("[")) {
					let o = this.tokenizer.rules.inline.reflinkSearch, u = (a) => {
						let p = a.lastIndexOf("[");
						if (!Object.hasOwn(this.tokens.links, a.slice(p + 1, -1))) return a;
						if (p > 1 && a.charAt(0) !== "!") {
							let c = a.slice(1, p - 1);
							if (this.linkInText(c)) return "[" + c.replace(o, u) + "][" + "a".repeat(a.length - p - 2) + "]";
						}
						return "[" + "a".repeat(a.length - 2) + "]";
					};
					n = n.replace(o, u);
				}
				n = n.replace(this.tokenizer.rules.inline.anyPunctuation, (o) => "+".repeat(o.length)), n = n.replace(this.tokenizer.rules.inline.blockSkip, (o, u, a) => {
					let p = a ? a.length : 0;
					return o.slice(0, p) + "[" + "a".repeat(o.length - p - 2) + "]";
				}), n = this.options.hooks?.emStrongMask?.call({ lexer: this }, n) ?? n;
				let s = !1, r = "", i = 1 / 0;
				for (; e;) {
					if (e.length < i) i = e.length;
					else {
						this.infiniteLoopError(e.charCodeAt(0));
						break;
					}
					s || (r = ""), s = !1;
					let o;
					if (this.options.extensions?.inline?.some((a) => (o = a.call({ lexer: this }, e, t)) ? (e = e.substring(o.raw.length), t.push(o), !0) : !1)) continue;
					if (o = this.tokenizer.escape(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.tag(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.link(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.reflink(e, this.tokens.links)) {
						e = e.substring(o.raw.length);
						let a = t.at(-1);
						o.type === "text" && a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
						continue;
					}
					if (o = this.tokenizer.emStrong(e, n, r)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.codespan(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.br(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.del(e, n, r)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (o = this.tokenizer.autolink(e)) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					if (!this.state.inLink && (o = this.tokenizer.url(e))) {
						e = e.substring(o.raw.length), t.push(o);
						continue;
					}
					let u = e;
					if (this.options.extensions?.startInline) {
						let a = 1 / 0, p = e.slice(1), c;
						this.options.extensions.startInline.forEach((h) => {
							c = h.call({ lexer: this }, p), typeof c == "number" && c >= 0 && (a = Math.min(a, c));
						}), a < 1 / 0 && a >= 0 && (u = e.substring(0, a + 1));
					}
					if (o = this.tokenizer.inlineText(u)) {
						e = e.substring(o.raw.length), o.raw.slice(-1) !== "_" && (r = o.raw.slice(-1)), s = !0;
						let a = t.at(-1);
						a?.type === "text" ? (a.raw += o.raw, a.text += o.text) : t.push(o);
						continue;
					}
					if (e) {
						this.infiniteLoopError(e.charCodeAt(0));
						break;
					}
				}
				return t;
			}
			infiniteLoopError(e) {
				let t = "Infinite loop on byte: " + e;
				if (this.options.silent) console.error(t);
				else throw new Error(t);
			}
		};
		var P = class {
			options;
			parser;
			constructor(e) {
				this.options = e || R;
			}
			space(e) {
				return "";
			}
			code({ text: e, lang: t, escaped: n }) {
				let s = (t || "").match(m.notSpaceStart)?.[0], r = e.replace(m.endingNewline, "") + `
`;
				return s ? "<pre><code class=\"language-" + T(s) + "\">" + (n ? r : T(r, !0)) + `</code></pre>
` : "<pre><code>" + (n ? r : T(r, !0)) + `</code></pre>
`;
			}
			blockquote({ tokens: e }) {
				return `<blockquote>
${this.parser.parse(e)}</blockquote>
`;
			}
			html({ text: e }) {
				return e;
			}
			def(e) {
				return "";
			}
			heading({ tokens: e, depth: t }) {
				return `<h${t}>${this.parser.parseInline(e)}</h${t}>
`;
			}
			hr(e) {
				return `<hr>
`;
			}
			list(e) {
				let t = e.ordered, n = e.start, s = "";
				for (let o = 0; o < e.items.length; o++) {
					let u = e.items[o];
					s += this.listitem(u);
				}
				let r = t ? "ol" : "ul", i = t && n !== 1 ? " start=\"" + n + "\"" : "";
				return "<" + r + i + `>
` + s + "</" + r + `>
`;
			}
			listitem(e) {
				return `<li>${this.parser.parse(e.tokens)}</li>
`;
			}
			checkbox({ checked: e }) {
				return "<input " + (e ? "checked=\"\" " : "") + "disabled=\"\" type=\"checkbox\"> ";
			}
			paragraph({ tokens: e }) {
				return `<p>${this.parser.parseInline(e)}</p>
`;
			}
			table(e) {
				let t = "", n = "";
				for (let r = 0; r < e.header.length; r++) n += this.tablecell(e.header[r]);
				t += this.tablerow({ text: n });
				let s = "";
				for (let r = 0; r < e.rows.length; r++) {
					let i = e.rows[r];
					n = "";
					for (let o = 0; o < i.length; o++) n += this.tablecell(i[o]);
					s += this.tablerow({ text: n });
				}
				return s && (s = `<tbody>${s}</tbody>`), `<table>
<thead>
` + t + `</thead>
` + s + `</table>
`;
			}
			tablerow({ text: e }) {
				return `<tr>
${e}</tr>
`;
			}
			tablecell(e) {
				let t = this.parser.parseInline(e.tokens), n = e.header ? "th" : "td";
				return (e.align ? `<${n} align="${e.align}">` : `<${n}>`) + t + `</${n}>
`;
			}
			strong({ tokens: e }) {
				return `<strong>${this.parser.parseInline(e)}</strong>`;
			}
			em({ tokens: e }) {
				return `<em>${this.parser.parseInline(e)}</em>`;
			}
			codespan({ text: e }) {
				return `<code>${T(e, !0)}</code>`;
			}
			br(e) {
				return "<br>";
			}
			del({ tokens: e }) {
				return `<del>${this.parser.parseInline(e)}</del>`;
			}
			link({ href: e, title: t, tokens: n }) {
				let s = this.parser.parseInline(n), r = Y(e);
				if (r === null) return s;
				e = r;
				let i = "<a href=\"" + e + "\"";
				return t && (i += " title=\"" + T(t) + "\""), i += ">" + s + "</a>", i;
			}
			image({ href: e, title: t, text: n, tokens: s }) {
				s && (n = this.parser.parseInline(s, this.parser.textRenderer));
				let r = Y(e);
				if (r === null) return T(n);
				e = r;
				let i = `<img src="${e}" alt="${T(n)}"`;
				return t && (i += ` title="${T(t)}"`), i += ">", i;
			}
			text(e) {
				return "tokens" in e && e.tokens ? this.parser.parseInline(e.tokens) : "escaped" in e && e.escaped ? e.text : T(e.text);
			}
		};
		var L = class {
			strong({ text: e }) {
				return e;
			}
			em({ text: e }) {
				return e;
			}
			codespan({ text: e }) {
				return e;
			}
			del({ text: e }) {
				return e;
			}
			html({ text: e }) {
				return e;
			}
			text({ text: e }) {
				return e;
			}
			link({ text: e }) {
				return "" + e;
			}
			image({ text: e }) {
				return "" + e;
			}
			br() {
				return "";
			}
			checkbox({ raw: e }) {
				return e;
			}
		};
		var b = class l {
			options;
			renderer;
			textRenderer;
			constructor(e) {
				this.options = e || R, this.options.renderer = this.options.renderer || new P(), this.renderer = this.options.renderer, this.renderer.options = this.options, this.renderer.parser = this, this.textRenderer = new L();
			}
			static parse(e, t) {
				return new l(t).parse(e);
			}
			static parseInline(e, t) {
				return new l(t).parseInline(e);
			}
			parse(e) {
				this.renderer.parser = this;
				let t = "";
				for (let n = 0; n < e.length; n++) {
					let s = e[n];
					if (this.options.extensions?.renderers?.[s.type]) {
						let i = s, o = this.options.extensions.renderers[i.type].call({ parser: this }, i);
						if (o !== !1 || ![
							"space",
							"hr",
							"heading",
							"code",
							"table",
							"blockquote",
							"list",
							"checkbox",
							"html",
							"def",
							"paragraph",
							"text"
						].includes(i.type)) {
							t += o || "";
							continue;
						}
					}
					let r = s;
					switch (r.type) {
						case "space":
							t += this.renderer.space(r);
							break;
						case "hr":
							t += this.renderer.hr(r);
							break;
						case "heading":
							t += this.renderer.heading(r);
							break;
						case "code":
							t += this.renderer.code(r);
							break;
						case "table":
							t += this.renderer.table(r);
							break;
						case "blockquote":
							t += this.renderer.blockquote(r);
							break;
						case "list":
							t += this.renderer.list(r);
							break;
						case "checkbox":
							t += this.renderer.checkbox(r);
							break;
						case "html":
							t += this.renderer.html(r);
							break;
						case "def":
							t += this.renderer.def(r);
							break;
						case "paragraph":
							t += this.renderer.paragraph(r);
							break;
						case "text":
							t += this.renderer.text(r);
							break;
						default: {
							let i = "Token with \"" + r.type + "\" type was not found.";
							if (this.options.silent) return console.error(i), "";
							throw new Error(i);
						}
					}
				}
				return t;
			}
			parseInline(e, t = this.renderer) {
				this.renderer.parser = this;
				let n = "";
				for (let s = 0; s < e.length; s++) {
					let r = e[s];
					if (this.options.extensions?.renderers?.[r.type]) {
						let o = this.options.extensions.renderers[r.type].call({ parser: this }, r);
						if (o !== !1 || ![
							"escape",
							"html",
							"link",
							"image",
							"checkbox",
							"strong",
							"em",
							"codespan",
							"br",
							"del",
							"text"
						].includes(r.type)) {
							n += o || "";
							continue;
						}
					}
					let i = r;
					switch (i.type) {
						case "escape":
							n += t.text(i);
							break;
						case "html":
							n += t.html(i);
							break;
						case "link":
							n += t.link(i);
							break;
						case "image":
							n += t.image(i);
							break;
						case "checkbox":
							n += t.checkbox(i);
							break;
						case "strong":
							n += t.strong(i);
							break;
						case "em":
							n += t.em(i);
							break;
						case "codespan":
							n += t.codespan(i);
							break;
						case "br":
							n += t.br(i);
							break;
						case "del":
							n += t.del(i);
							break;
						case "text":
							n += t.text(i);
							break;
						default: {
							let o = "Token with \"" + i.type + "\" type was not found.";
							if (this.options.silent) return console.error(o), "";
							throw new Error(o);
						}
					}
				}
				return n;
			}
		};
		var S = class {
			options;
			block;
			constructor(e) {
				this.options = e || R;
			}
			static passThroughHooks = /* @__PURE__ */ new Set([
				"preprocess",
				"postprocess",
				"processAllTokens",
				"emStrongMask"
			]);
			static passThroughHooksRespectAsync = /* @__PURE__ */ new Set([
				"preprocess",
				"postprocess",
				"processAllTokens"
			]);
			preprocess(e) {
				return e;
			}
			postprocess(e) {
				return e;
			}
			processAllTokens(e) {
				return e;
			}
			emStrongMask(e) {
				return e;
			}
			provideLexer(e = this.block) {
				return e ? x.lex : x.lexInline;
			}
			provideParser(e = this.block) {
				return e ? b.parse : b.parseInline;
			}
		};
		var Z = class {
			defaults = A();
			options = this.setOptions;
			parse = this.parseMarkdown(!0);
			parseInline = this.parseMarkdown(!1);
			Parser = b;
			Renderer = P;
			TextRenderer = L;
			Lexer = x;
			Tokenizer = y;
			Hooks = S;
			constructor(...e) {
				this.use(...e);
			}
			walkTokens(e, t) {
				let n = [];
				for (let s of e) switch (n = n.concat(t.call(this, s)), s.type) {
					case "table": {
						let r = s;
						for (let i of r.header) n = n.concat(this.walkTokens(i.tokens, t));
						for (let i of r.rows) for (let o of i) n = n.concat(this.walkTokens(o.tokens, t));
						break;
					}
					case "list": {
						let r = s;
						n = n.concat(this.walkTokens(r.items, t));
						break;
					}
					default: {
						let r = s;
						this.defaults.extensions?.childTokens?.[r.type] ? this.defaults.extensions.childTokens[r.type].forEach((i) => {
							let o = r[i].flat(1 / 0);
							n = n.concat(this.walkTokens(o, t));
						}) : r.tokens && (n = n.concat(this.walkTokens(r.tokens, t)));
					}
				}
				return n;
			}
			use(...e) {
				let t = this.defaults.extensions || {
					renderers: {},
					childTokens: {}
				};
				return e.forEach((n) => {
					let s = { ...n };
					if (s.async = this.defaults.async || s.async || !1, n.extensions && (n.extensions.forEach((r) => {
						if (!r.name) throw new Error("extension name required");
						if ("renderer" in r) {
							let i = t.renderers[r.name];
							i ? t.renderers[r.name] = function(...o) {
								let u = r.renderer.apply(this, o);
								return u === !1 && (u = i.apply(this, o)), u;
							} : t.renderers[r.name] = r.renderer;
						}
						if ("tokenizer" in r) {
							if (!r.level || r.level !== "block" && r.level !== "inline") throw new Error("extension level must be 'block' or 'inline'");
							let i = t[r.level];
							i ? i.unshift(r.tokenizer) : t[r.level] = [r.tokenizer], r.start && (r.level === "block" ? t.startBlock ? t.startBlock.push(r.start) : t.startBlock = [r.start] : r.level === "inline" && (t.startInline ? t.startInline.push(r.start) : t.startInline = [r.start]));
						}
						"childTokens" in r && r.childTokens && (t.childTokens[r.name] = r.childTokens);
					}), s.extensions = t), n.renderer) {
						let r = this.defaults.renderer || new P(this.defaults);
						for (let i in n.renderer) {
							if (!(i in r)) throw new Error(`renderer '${i}' does not exist`);
							if (["options", "parser"].includes(i)) continue;
							let o = i, u = n.renderer[o], a = r[o];
							r[o] = (...p) => {
								let c = u.apply(r, p);
								return c === !1 && (c = a.apply(r, p)), c || "";
							};
						}
						s.renderer = r;
					}
					if (n.tokenizer) {
						let r = this.defaults.tokenizer || new y(this.defaults);
						for (let i in n.tokenizer) {
							if (!(i in r)) throw new Error(`tokenizer '${i}' does not exist`);
							if ([
								"options",
								"rules",
								"lexer"
							].includes(i)) continue;
							let o = i, u = n.tokenizer[o], a = r[o];
							r[o] = (...p) => {
								let c = u.apply(r, p);
								return c === !1 && (c = a.apply(r, p)), c;
							};
						}
						s.tokenizer = r;
					}
					if (n.hooks) {
						let r = this.defaults.hooks || new S();
						for (let i in n.hooks) {
							if (!(i in r)) throw new Error(`hook '${i}' does not exist`);
							if (["options", "block"].includes(i)) continue;
							let o = i, u = n.hooks[o], a = r[o];
							S.passThroughHooks.has(i) ? r[o] = (p) => {
								if (this.defaults.async && S.passThroughHooksRespectAsync.has(i)) return (async () => {
									let h = await u.call(r, p);
									return a.call(r, h);
								})();
								let c = u.call(r, p);
								return a.call(r, c);
							} : r[o] = (...p) => {
								if (this.defaults.async) return (async () => {
									let h = await u.apply(r, p);
									return h === !1 && (h = await a.apply(r, p)), h;
								})();
								let c = u.apply(r, p);
								return c === !1 && (c = a.apply(r, p)), c;
							};
						}
						s.hooks = r;
					}
					if (n.walkTokens) {
						let r = this.defaults.walkTokens, i = n.walkTokens;
						s.walkTokens = function(o) {
							let u = [];
							return u.push(i.call(this, o)), r && (u = u.concat(r.call(this, o))), u;
						};
					}
					this.defaults = {
						...this.defaults,
						...s
					};
				}), this;
			}
			setOptions(e) {
				return this.defaults = {
					...this.defaults,
					...e
				}, this;
			}
			lexer(e, t) {
				return x.lex(e, t ?? this.defaults);
			}
			parser(e, t) {
				return b.parse(e, t ?? this.defaults);
			}
			parseMarkdown(e) {
				return (n, s) => {
					let r = { ...s }, i = {
						...this.defaults,
						...r
					}, o = this.onError(!!i.silent, !!i.async);
					if (this.defaults.async === !0 && r.async === !1) return o(/* @__PURE__ */ new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));
					if (typeof n > "u" || n === null) return o(/* @__PURE__ */ new Error("marked(): input parameter is undefined or null"));
					if (typeof n != "string") return o(/* @__PURE__ */ new Error("marked(): input parameter is of type " + Object.prototype.toString.call(n) + ", string expected"));
					if (i.hooks && (i.hooks.options = i, i.hooks.block = e), i.async) return (async () => {
						let u = i.hooks ? await i.hooks.preprocess(n) : n, p = await (i.hooks ? await i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(u, i), c = i.hooks ? await i.hooks.processAllTokens(p) : p;
						i.walkTokens && await Promise.all(this.walkTokens(c, i.walkTokens));
						let d = await (i.hooks ? await i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(c, i);
						return i.hooks ? await i.hooks.postprocess(d) : d;
					})().catch(o);
					try {
						i.hooks && (n = i.hooks.preprocess(n));
						let a = (i.hooks ? i.hooks.provideLexer(e) : e ? x.lex : x.lexInline)(n, i);
						i.hooks && (a = i.hooks.processAllTokens(a)), i.walkTokens && this.walkTokens(a, i.walkTokens);
						let c = (i.hooks ? i.hooks.provideParser(e) : e ? b.parse : b.parseInline)(a, i);
						return i.hooks && (c = i.hooks.postprocess(c)), c;
					} catch (u) {
						return o(u);
					}
				};
			}
			onError(e, t) {
				return (n) => {
					if (n.message += `
Please report this to https://github.com/markedjs/marked.`, e) {
						let s = "<p>An error occurred:</p><pre>" + T(n.message + "", !0) + "</pre>";
						return t ? Promise.resolve(s) : s;
					}
					if (t) return Promise.reject(n);
					throw n;
				};
			}
		};
		var M = new Z();
		function f(l, e) {
			return M.parse(l, e);
		}
		f.options = f.setOptions = function(l) {
			return M.setOptions(l), f.defaults = M.defaults, j(f.defaults), f;
		};
		f.getDefaults = A;
		f.defaults = R;
		function dt(...l) {
			return M.use(...l), f.defaults = M.defaults, j(f.defaults), f;
		}
		f.use = dt;
		f.walkTokens = function(l, e) {
			return M.walkTokens(l, e);
		};
		f.parseInline = M.parseInline;
		f.Parser = b;
		f.parser = b.parse;
		f.Renderer = P;
		f.TextRenderer = L;
		f.Lexer = x;
		f.lexer = x.lex;
		f.Tokenizer = y;
		f.Hooks = S;
		f.parse = f;
		f.options;
		f.setOptions;
		f.walkTokens;
		f.parseInline;
		b.parse;
		x.lex;
		//#endregion
		//#region lib/types/client/editor/MarkdownPreview.js
		/**
		* Markdown preview using `marked`.
		*/
		/**
		* Render markdown source as HTML inside a scrollable pane.
		*/
		function MarkdownPreview(props) {
			const html = (0, react.useMemo)(() => {
				try {
					return f.parse(props.content, { async: false });
				} catch (error) {
					return `<pre>${escapeHtml(error instanceof Error ? error.message : "preview failed")}</pre>`;
				}
			}, [props.content]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: editor_module_css_default.preview,
				"data-file-explorer-preview": "",
				dangerouslySetInnerHTML: { __html: html }
			});
		}
		function escapeHtml(text) {
			return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
		}
		//#endregion
		//#region lib/types/client/editor/EditorSurface.js
		/**
		* Center-column editor: tabs + Monaco/textarea + markdown preview.
		*/
		const appearanceStore = new EditorAppearanceStore();
		/**
		* Editor options imported from the local VSCode settings, or null when none.
		* Re-applied whenever an editor is created: a fresh editor would otherwise
		* revert to the hard-coded defaults and silently drop the import.
		*/
		let importedEditorOptions = null;
		/**
		* Multi-tab editor surface bound to explorer RPC + local stores.
		*/
		function EditorSurface(props) {
			const { ctx, api, tabs, buffers, mdModes, external } = props;
			const t = useExplorerT(ctx);
			const tabState = (0, react.useSyncExternalStore)(tabs.subscribe, tabs.getSnapshot);
			// Subscribe to the whole buffer entry, not just its `content`: `markStale`
			// flips a flag without touching the text, and a content-only snapshot
			// would let React skip the very re-render that shows the warning.
			(0, react.useSyncExternalStore)(buffers.subscribe, () => buffers.get(tabState.activePath ?? ""));
			(0, react.useSyncExternalStore)(mdModes.subscribe, () => tabState.activePath === null ? "source" : mdModes.get(tabState.activePath));
			const appearance = (0, react.useSyncExternalStore)(appearanceStore.subscribe, appearanceStore.getSnapshot);
			const [error, setError] = (0, react.useState)(null);
			const [status, setStatus] = (0, react.useState)("");
			const [cursorPos, setCursorPos] = (0, react.useState)({
				line: 1,
				column: 1
			});
			const [monacoReady, setMonacoReady] = (0, react.useState)(false);
			const [monacoFailed, setMonacoFailed] = (0, react.useState)(false);
			const [appearanceOpen, setAppearanceOpen] = (0, react.useState)(false);
			const [vscodeThemeName, setVscodeThemeName] = (0, react.useState)(null);
			const hostRef = (0, react.useRef)(null);
			const editorRef = (0, react.useRef)(null);
			const applyingExternal = (0, react.useRef)(false);
			const activePath = tabState.activePath;
			const buffer = activePath === null ? void 0 : buffers.get(activePath);
			const mdMode = activePath !== null && isMarkdownPath(activePath) ? mdModes.get(activePath) : "source";
			(0, react.useLayoutEffect)(() => {
				appearanceStore.hydrate();
			}, []);
			/**
			* Adopt the local VSCode profile (theme + explicitly configured editor
			* options) so the editor matches what the user already uses to write code.
			*
			* Best-effort and strictly additive: `found: false` (no VSCode installed) is
			* a normal outcome, a failed parse is ignored, and a theme the user picked in
			* this editor is never overridden.
			*/
			(0, react.useEffect)(() => {
				let cancelled = false;
				api.vscodeProfile().then((result) => {
					if (cancelled || !result.ok) return;
					const payload = result.value;
					if (!payload.found || payload.profile === "") return;
					let parsed;
					try {
						parsed = JSON.parse(payload.profile);
					} catch {
						return;
					}
					if (cancelled || parsed === null || typeof parsed !== "object") return;
					const theme = parsed.theme ?? null;
					if (theme !== null) {
						vscodeThemeDefinition = theme;
						setVscodeThemeName(typeof theme.name === "string" && theme.name !== "" ? theme.name : payload.source);
					}
					const options = parsed.editorOptions ?? null;
					if (options !== null && typeof options === "object") {
						importedEditorOptions = options;
						const editor = editorRef.current;
						if (editor !== null) {
							try {
								editor.updateOptions(options);
							} catch {
								/* ignore option keys this Monaco build rejects */
							}
						}
					}
					if (theme === null || appearanceStore.hasThemeChoice()) return;
					appearanceStore.adoptTheme(VSCODE_THEME_ID);
				}).catch(() => {
					/* the local profile is an optional enhancement */
				});
				return () => {
					cancelled = true;
				};
			}, [api]);
			const openPath = (0, react.useCallback)(async (path) => {
				tabs.open(path);
				if (buffers.get(path) !== void 0) return;
				const result = await api.read(path);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					tabs.close(path);
					return;
				}
				setError(null);
				buffers.load(path, result.value.content, result.value.mtimeMs);
			}, [
				api,
				buffers,
				tabs
			]);
			(0, react.useEffect)(() => {
				const handler = (event) => {
					const detail = event.detail;
					if (detail?.path) openPath(detail.path);
				};
				window.addEventListener("file-explorer:open", handler);
				return () => window.removeEventListener("file-explorer:open", handler);
			}, [openPath]);
			const saveActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const entry = buffers.get(activePath);
				if (entry === void 0) return;
				// Optimistic concurrency: hand the host the revision this buffer was
				// read from. If the agent (or anything else) rewrote the file since,
				// the host refuses instead of letting this save win silently.
				const expected = typeof entry.mtimeMs === "number" ? entry.mtimeMs : -1;
				const result = await api.write(activePath, entry.content, expected);
				if (!result.ok) {
					if (result.error.code === "CONFLICT") {
						buffers.markStale(activePath);
						setError(t("editorConflict"));
						return;
					}
					setError(describeRpcError(result.error, t));
					return;
				}
				buffers.markSaved(activePath, result.value.mtimeMs);
				setError(null);
				setStatus(t("editorSaved"));
				window.setTimeout(() => setStatus(""), 1200);
			}, [
				activePath,
				api,
				buffers,
				t
			]);
			/** Replace the buffer with the current disk revision (explicit user intent). */
			const reloadActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const result = await api.read(activePath);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				buffers.load(activePath, result.value.content, result.value.mtimeMs);
				setError(null);
			}, [
				activePath,
				api,
				buffers
			]);
			/**
			* Overwrite the disk revision on purpose.
			*
			* Without this the conflict guard would be a dead end: a dirty buffer whose
			* file moved on could never be saved at all. `-1` explicitly opts out of
			* the revision check.
			*/
			const forceSaveActive = (0, react.useCallback)(async () => {
				if (activePath === null) return;
				const entry = buffers.get(activePath);
				if (entry === void 0) return;
				const result = await api.write(activePath, entry.content, -1);
				if (!result.ok) {
					setError(result.error.message);
					return;
				}
				buffers.markSaved(activePath, result.value.mtimeMs);
				setError(null);
				setStatus(t("editorSaved"));
				window.setTimeout(() => setStatus(""), 1200);
			}, [
				activePath,
				api,
				buffers,
				t
			]);
			/**
			* Reconcile open buffers with the host's change feed.
			*
			* A clean buffer is silently reverted to the disk revision — that is what
			* it should look like when something else rewrites a file you are merely
			* looking at. A buffer with unsaved edits is never touched: it is flagged
			* so the user can choose between reloading and saving over.
			*/
			(0, react.useEffect)(() => {
				if (external === null) return;
				const open = tabs.getSnapshot().open;
				if (open.length === 0) return;
				let cancelled = false;
				const run = async () => {
					for (const tab of open) {
						if (cancelled) return;
						if (!external.paths.has(tab.path)) continue;
						if (buffers.get(tab.path) === void 0) continue;
						if (buffers.isDirty(tab.path)) {
							buffers.markStale(tab.path);
							continue;
						}
						const result = await api.read(tab.path);
						if (cancelled || !result.ok) continue;
						buffers.load(tab.path, result.value.content, result.value.mtimeMs);
					}
				};
				void run();
				return () => {
					cancelled = true;
				};
			}, [
				external,
				api,
				buffers,
				tabs
			]);
			const activeStale = buffer !== void 0 && buffer.stale === true;
			const canFormat = monacoReady && !monacoFailed && activePath !== null && FORMATTABLE_LANGUAGES.has(languageForPath(activePath));
			const formatActive = (0, react.useCallback)(async () => {
				const editor = editorRef.current;
				if (editor === null) return;
				const action = editor.getAction("editor.action.formatDocument");
				if (action === void 0) {
					setStatus(t("editorFormatUnavailable"));
					window.setTimeout(() => setStatus(""), 1600);
					return;
				}
				try {
					await action.run();
					setStatus(t("editorFormatted"));
				} catch {
					setStatus(t("editorFormatUnavailable"));
				}
				window.setTimeout(() => setStatus(""), 1600);
			}, [t]);
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
						event.preventDefault();
						saveActive();
						return;
					}
					if (canFormat && event.altKey && event.shiftKey && event.key.toLowerCase() === "f") {
						event.preventDefault();
						void formatActive();
					}
				};
				window.addEventListener("keydown", onKey);
				return () => window.removeEventListener("keydown", onKey);
			}, [
				saveActive,
				formatActive,
				canFormat
			]);
			(0, react.useEffect)(() => {
				let cancelled = false;
				let attempt = 0;
				const LOAD_ATTEMPTS = 3;
				const RETRY_DELAY_MS = 4e3;
				/**
				* Monaco is fetched from a CDN, so a slow or flaky link can blow the load
				* budget. Retrying matters because the timeout path rejects the promise
				* while the underlying fetch may still land — a retry then resolves straight
				* off the already-populated `window.monaco`, instead of leaving the editor
				* stuck in plain-textarea mode for the rest of the session (observed
				* happening before this was added).
				*/
				const attemptLoad = () => {
					loadMonaco().then(() => {
						if (!cancelled) setMonacoReady(true);
					}).catch(() => {
						if (cancelled) return;
						attempt += 1;
						if (attempt < LOAD_ATTEMPTS) window.setTimeout(attemptLoad, RETRY_DELAY_MS);
						else setMonacoFailed(true);
					});
				};
				attemptLoad();
				return () => {
					cancelled = true;
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!monacoReady || monacoFailed || hostRef.current === null || activePath === null) {
					editorRef.current?.dispose();
					editorRef.current = null;
					return;
				}
				if (mdMode === "preview") {
					editorRef.current?.dispose();
					editorRef.current = null;
					return;
				}
				let disposed = false;
				let createdModel = null;
				const snap = appearanceStore.getSnapshot();
				loadMonaco().then((monaco) => {
					if (disposed || hostRef.current === null) return;
					editorRef.current?.dispose();
					editorRef.current = null;
					const content = buffers.get(activePath)?.content ?? "";
					applyMonacoAppearance(monaco, snap);
					createdModel = monaco.editor.createModel(content, languageForPath(activePath), modelUriFor(monaco, activePath));
					const editor = monaco.editor.create(hostRef.current, {
						model: createdModel,
						automaticLayout: true,
						minimap: {
							enabled: snap.minimap === true,
							renderCharacters: false
						},
						fontSize: snap.fontSize,
						theme: snap.customBackground === null ? snap.theme : EDITOR_CUSTOM_THEME_ID,
						scrollBeyondLastLine: false,
						folding: true,
						foldingStrategy: "auto",
						foldingHighlight: true,
						showFoldingControls: "mouseover",
						bracketPairColorization: {
							enabled: true,
							independentColorPoolPerBracketType: true
						},
						guides: {
							bracketPairs: true,
							indentation: true,
							highlightActiveIndentation: true
						},
						matchBrackets: "always",
						linkedEditing: true,
						autoClosingBrackets: "languageDefined",
						autoClosingQuotes: "languageDefined",
						autoClosingTags: true,
						autoSurround: "languageDefined",
						formatOnPaste: true,
						snippetSuggestions: "top",
						quickSuggestions: {
							other: true,
							comments: false,
							strings: true
						},
						wordBasedSuggestions: "currentDocument",
						suggest: {
							preview: true,
							showWords: true
						},
						parameterHints: {
							enabled: true,
							cycle: true
						},
						hover: {
							enabled: true,
							delay: 180
						},
						links: true,
						colorDecorators: true,
						codeLens: true,
						stickyScroll: {
							enabled: true,
							maxLineCount: 5
						},
						renderWhitespace: "selection",
						renderControlCharacters: true,
						renderLineHighlight: "all",
						occurrencesHighlight: "singleFile",
						selectionHighlight: true,
						unicodeHighlight: {
							ambiguousCharacters: false,
							invisibleCharacters: true,
							nonBasicASCII: false
						},
						scrollbar: {
							verticalScrollbarSize: 10,
							horizontalScrollbarSize: 10,
							useShadows: false
						},
						smoothScrolling: true,
						detectIndentation: true,
						tabSize: 2,
						padding: {
							top: 8,
							bottom: 8
						}
					});
					if (importedEditorOptions !== null) {
						try {
							editor.updateOptions(importedEditorOptions);
						} catch {
							/* ignore option keys this Monaco build rejects */
						}
					}
					editorRef.current = editor;
					const initialPosition = editor.getPosition();
					if (initialPosition !== null) setCursorPos({
						line: initialPosition.lineNumber,
						column: initialPosition.column
					});
					editor.onDidChangeCursorPosition((event) => {
						setCursorPos({
							line: event.position.lineNumber,
							column: event.position.column
						});
					});
					editor.onDidChangeModelContent(() => {
						if (applyingExternal.current) return;
						buffers.setContent(activePath, editor.getValue());
					});
				});
				return () => {
					disposed = true;
					editorRef.current?.dispose();
					editorRef.current = null;
					if (createdModel !== null) {
						createdModel.dispose();
						createdModel = null;
					}
				};
			}, [
				monacoReady,
				monacoFailed,
				activePath,
				mdMode,
				buffers
			]);
			(0, react.useEffect)(() => {
				if (!monacoReady || monacoFailed) return;
				loadMonaco().then((monaco) => {
					applyMonacoAppearance(monaco, appearance);
					editorRef.current?.updateOptions({
						fontSize: appearance.fontSize,
						minimap: {
							enabled: appearance.minimap === true,
							renderCharacters: false
						}
					});
				});
			}, [
				appearance.theme,
				appearance.customBackground,
				appearance.fontSize,
				appearance.minimap,
				monacoReady,
				monacoFailed
			]);
			(0, react.useEffect)(() => {
				if (activePath === null || editorRef.current === null) return;
				const next = buffers.get(activePath)?.content ?? "";
				if (editorRef.current.getValue() === next) return;
				applyingExternal.current = true;
				try {
					editorRef.current.setValue(next);
				} finally {
					applyingExternal.current = false;
				}
			}, [
				activePath,
				buffer?.content,
				buffers
			]);
			const dropTab = (0, react.useCallback)((path) => {
				tabs.close(path);
				buffers.drop(path);
				mdModes.drop(path);
			}, [
				buffers,
				mdModes,
				tabs
			]);
			const onClose = (0, react.useCallback)((path) => {
				if (buffers.isDirty(path)) {
					if (!window.confirm(t("confirmCloseDirty"))) return;
				}
				dropTab(path);
			}, [
				buffers,
				dropTab,
				t
			]);
			const onClosePaths = (0, react.useCallback)((paths) => {
				if (paths.length === 0) return;
				if (paths.some((path) => buffers.isDirty(path)) && !window.confirm(t("confirmCloseDirty"))) return;
				for (const path of paths) dropTab(path);
			}, [
				buffers,
				dropTab,
				t
			]);
			(0, react.useEffect)(() => {
				const onEditorKey = (event) => {
					if (!(event.target instanceof Element) || !event.target.closest('[data-file-explorer-editor]')) return;
					if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "w" && activePath !== null) {
						event.preventDefault();
						onClose(activePath);
					}
				};
				window.addEventListener("keydown", onEditorKey);
				return () => window.removeEventListener("keydown", onEditorKey);
			}, [activePath, onClose]);
			if (tabState.open.length === 0 || activePath === null) return (0, react_jsx_runtime.jsx)("div", {
				className: editor_module_css_default.surface,
				"data-file-explorer-editor": "",
				children: (0, react_jsx_runtime.jsx)("div", {
					className: editor_module_css_default.empty,
					children: t("editorEmpty")
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: editor_module_css_default.surface,
				"data-file-explorer-editor": "",
				children: [
					(0, react_jsx_runtime.jsx)(TabStrip, {
						tabs: tabState.open,
						activePath,
						buffers,
						t,
						onActivate: (path) => tabs.activate(path),
						onClose,
						onClosePaths
					}),
					error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.errorBanner,
						children: error
					}) : null,
					activeStale ? (0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.errorBanner,
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							gap: "8px"
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							children: t("editorStaleBanner")
						}), (0, react_jsx_runtime.jsxs)("span", {
							style: {
								display: "inline-flex",
								gap: "6px",
								flexShrink: 0
							},
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void reloadActive(),
								children: t("editorReload")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void forceSaveActive(),
								children: t("editorForceSave")
							})]
						})]
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: editor_module_css_default.toolbar,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								onClick: () => void saveActive(),
								children: t("editorSave")
							}),
							canFormat ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: editor_module_css_default.toolBtn,
								title: `${t("editorFormat")} (Shift+Alt+F)`,
								onClick: () => void formatActive(),
								children: t("editorFormat")
							}) : null,
							isMarkdownPath(activePath) ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: mdMode === "source" ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
								onClick: () => mdModes.set(activePath, "source"),
								children: t("editorSource")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: mdMode === "preview" ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
								onClick: () => mdModes.set(activePath, "preview"),
								children: t("editorPreview")
							})] }) : null,
							(0, react_jsx_runtime.jsx)("span", {
								className: editor_module_css_default.status,
								children: status || (monacoFailed ? t("editorTextareaMode") : "")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: editor_module_css_default.toolbarEnd,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: appearanceOpen ? `${editor_module_css_default.toolBtn} ${editor_module_css_default.toolBtnActive}` : editor_module_css_default.toolBtn,
									"aria-expanded": appearanceOpen,
									"aria-haspopup": "dialog",
									onClick: () => setAppearanceOpen((open) => !open),
									children: t("editorAppearance")
								}), appearanceOpen ? (0, react_jsx_runtime.jsx)(AppearanceMenu, {
									t,
									appearance,
									store: appearanceStore,
									hasImportedTheme: vscodeThemeName !== null,
									onClose: () => setAppearanceOpen(false)
								}) : null]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.pathBar,
						title: activePath,
						"aria-label": t("editorFilePath"),
						"data-editor-breadcrumb": "",
						children: activePath.replaceAll("\\", "/").split("/").filter(Boolean).map((part, index, parts) => (0, react_jsx_runtime.jsxs)("span", {
							className: index === parts.length - 1 ? "vscodeCrumbFile" : "vscodeCrumbFolder",
							children: [index > 0 ? (0, react_jsx_runtime.jsx)("span", { className: "crumbSep", children: "›" }) : null, index === parts.length - 1 ? (0, react_jsx_runtime.jsx)(FileIcon, { name: part }) : null, part]
						}, `${index}:${part}`))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: editor_module_css_default.body,
						children: mdMode === "preview" ? (0, react_jsx_runtime.jsx)(MarkdownPreview, { content: buffer?.content ?? "" }) : monacoReady && !monacoFailed ? (0, react_jsx_runtime.jsx)("div", {
							className: editor_module_css_default.monacoHost,
							ref: hostRef
						}) : (0, react_jsx_runtime.jsx)("textarea", {
							className: editor_module_css_default.textarea,
							style: {
								fontSize: appearance.fontSize,
								...appearance.customBackground !== null ? { background: appearance.customBackground } : {}
							},
							value: buffer?.content ?? "",
							onChange: (event) => buffers.setContent(activePath, event.target.value),
							spellCheck: false
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: "editorStatusBar",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: "DSH"
						}), buffer !== void 0 && buffer.content !== buffer.savedContent ? (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem statusDirty",
							children: "● 未保存"
						}) : null, (0, react_jsx_runtime.jsxs)("span", {
							className: "statusItem",
							style: { marginLeft: "auto" },
							children: ["Ln ", cursorPos.line, ", Col ", cursorPos.column]
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: "UTF-8"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "statusItem",
							children: languageForPath(activePath)
						})]
					})
				]
			});
		}
		/** Dispatch a cross-component open request. */
		function requestOpenPath(path) {
			window.dispatchEvent(new CustomEvent("file-explorer:open", { detail: { path } }));
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/ui/dsh-plugin-file-explorer/src/client/settings/settings-card.module.css.mjs
		const css$1 = ".yVXJpq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}.yVXJpq_card:hover{border-color:var(--dsw-alias-label-dimmed)}.yVXJpq_cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}.yVXJpq_header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}.yVXJpq_header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}.yVXJpq_headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.yVXJpq_name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}.yVXJpq_description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}.yVXJpq_chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}.yVXJpq_chevronOpen{transform:rotate(180deg)}.yVXJpq_body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}.yVXJpq_readOnly{color:var(--dsw-alias-label-tertiary);margin:12px 0 0;font-size:12px;line-height:1.5}.yVXJpq_field{flex-direction:column;gap:6px;padding:12px 0;display:flex}.yVXJpq_field+.yVXJpq_field{border-top:1px solid var(--dsw-alias-border-l2)}.yVXJpq_row{cursor:pointer;color:var(--dsw-alias-label-primary);align-items:center;gap:8px;font-size:13px;font-weight:500;line-height:1.5;display:flex}.yVXJpq_rowDisabled{cursor:not-allowed;opacity:.55}.yVXJpq_checkbox{width:14px;height:14px;accent-color:var(--dsw-alias-brand-primary);flex:none;margin:0}.yVXJpq_textInput{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);font:inherit;border-radius:8px;padding:8px 10px;font-size:13px}.yVXJpq_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}.yVXJpq_label{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}";
		const tagId$1 = "dsh-vscode/settings-card.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-vscode";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var settings_card_module_css_default = {
			"body": "yVXJpq_body",
			"card": "yVXJpq_card",
			"cardOpen": "yVXJpq_cardOpen",
			"checkbox": "yVXJpq_checkbox",
			"chevron": "yVXJpq_chevron",
			"chevronOpen": "yVXJpq_chevronOpen",
			"description": "yVXJpq_description",
			"field": "yVXJpq_field",
			"headText": "yVXJpq_headText",
			"header": "yVXJpq_header",
			"hint": "yVXJpq_hint",
			"label": "yVXJpq_label",
			"name": "yVXJpq_name",
			"readOnly": "yVXJpq_readOnly",
			"row": "yVXJpq_row",
			"rowDisabled": "yVXJpq_rowDisabled",
			"textInput": "yVXJpq_textInput"
		};
		//#endregion
		//#region lib/types/client/settings/ExplorerSettingsCard.js
		/**
		* Settings → Plugins card for file explorer preferences.
		*/
		function ChevronDown({ className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: 14,
				height: 14,
				className,
				viewBox: "0 0 14 14",
				fill: "none",
				"aria-hidden": true,
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M11.8486 5.5L11.4238 5.92383L8.69727 8.65137C8.44157 8.90706 8.21562 9.13382 8.01172 9.29785C7.79912 9.46883 7.55595 9.61756 7.25 9.66602C7.08435 9.69222 6.91565 9.69222 6.75 9.66602C6.44405 9.61756 6.20088 9.46883 5.98828 9.29785C5.78438 9.13382 5.55843 8.90706 5.30273 8.65137L2.57617 5.92383L2.15137 5.5L3 4.65137L3.42383 5.07617L6.15137 7.80273C6.42595 8.07732 6.59876 8.24849 6.74023 8.3623C6.87291 8.46904 6.92272 8.47813 6.9375 8.48047C6.97895 8.48703 7.02105 8.48703 7.0625 8.48047C7.07728 8.47813 7.12709 8.46904 7.25977 8.3623C7.40124 8.24849 7.57405 8.07732 7.84863 7.80273L10.5762 5.07617L11 4.65137L11.8486 5.5Z",
					fill: "currentColor"
				})
			});
		}
		/** Collapsed-by-default plugin configuration card. */
		function ExplorerSettingsCard(props) {
			const { ctx, scope } = props;
			const snap = (0, react.useSyncExternalStore)((listener) => scope.subscribe(listener), () => scope.getSnapshot());
			const t = explorerT((0, react.useSyncExternalStore)((listener) => ctx.locale.subscribe(listener), () => ctx.locale.getSnapshot().active));
			const [open, setOpen] = (0, react.useState)(false);
			const [draftRoot, setDraftRoot] = (0, react.useState)(null);
			const [saving, setSaving] = (0, react.useState)(false);
			const available = snap.status === "ready";
			const writable = snap.writable;
			const value = snap.value;
			if (!available || value === void 0) return null;
			const hasRootField = value.root !== void 0;
			const rootValue = draftRoot ?? value.root;
			const openLinks = value.openLinksInEditor;
			const commitRoot = (0, react.useCallback)(async () => {
				if (!writable || saving || draftRoot === null) return;
				setSaving(true);
				try {
					await scope.set("root", draftRoot);
					setDraftRoot(null);
				} finally {
					setSaving(false);
				}
			}, [
				draftRoot,
				saving,
				scope,
				writable
			]);
			const toggleLinks = (0, react.useCallback)(async (checked) => {
				if (!writable || saving) return;
				setSaving(true);
				try {
					await scope.set("openLinksInEditor", checked);
				} finally {
					setSaving(false);
				}
			}, [
				saving,
				scope,
				writable
			]);
			const title = t("settingsTitle");
			return (0, react_jsx_runtime.jsxs)("li", {
				className: open ? `${settings_card_module_css_default.card} ${settings_card_module_css_default.cardOpen}` : settings_card_module_css_default.card,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: settings_card_module_css_default.header,
					"aria-expanded": open,
					"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
					onClick: () => {
						setOpen((v) => !v);
					},
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: settings_card_module_css_default.headText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.name,
							children: title
						}), (0, react_jsx_runtime.jsx)("span", {
							className: settings_card_module_css_default.description,
							children: t("settingsDescription")
						})]
					}), (0, react_jsx_runtime.jsx)(ChevronDown, { className: [settings_card_module_css_default.chevron, open ? settings_card_module_css_default.chevronOpen : void 0].filter(Boolean).join(" ") })]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: settings_card_module_css_default.body,
					children: [
						!writable ? (0, react_jsx_runtime.jsx)("p", {
							className: settings_card_module_css_default.readOnly,
							role: "status",
							children: t("readOnly")
						}) : null,
						hasRootField ? (0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [
								(0, react_jsx_runtime.jsx)("label", {
									className: settings_card_module_css_default.label,
									htmlFor: "fe-root",
									children: t("settingsRoot")
								}),
								(0, react_jsx_runtime.jsx)("input", {
									id: "fe-root",
									className: settings_card_module_css_default.textInput,
									value: rootValue,
									disabled: !writable || saving,
									onChange: (event) => setDraftRoot(event.target.value),
									onBlur: () => {
										commitRoot();
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") commitRoot();
									}
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: settings_card_module_css_default.hint,
									children: t("settingsRootHint")
								})
							]
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: settings_card_module_css_default.field,
							children: [(0, react_jsx_runtime.jsxs)("label", {
								className: writable ? settings_card_module_css_default.row : `${settings_card_module_css_default.row} ${settings_card_module_css_default.rowDisabled}`,
								children: [(0, react_jsx_runtime.jsx)("input", {
									className: settings_card_module_css_default.checkbox,
									type: "checkbox",
									checked: openLinks,
									disabled: !writable || saving,
									onChange: (event) => {
										toggleLinks(event.target.checked);
									}
								}), (0, react_jsx_runtime.jsx)("span", { children: t("settingsOpenLinks") })]
							}), (0, react_jsx_runtime.jsx)("p", {
								className: settings_card_module_css_default.hint,
								children: t("settingsOpenLinksHint")
							})]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/open-links.js
		/**
		* Capture clicks on conversation file-looking links and open them in the editor.
		*/
		const ABS_PATH = /^(?:\/|[A-Za-z]:[\\/])/;
		const REL_PATH = /^\.\.?[\\/]/;
		function candidateFromAnchor(anchor) {
			const dataPath = anchor.getAttribute("data-path") ?? anchor.getAttribute("data-filepath");
			if (dataPath !== null && dataPath.trim() !== "") return dataPath.trim();
			const href = anchor.getAttribute("href");
			if (href === null || href === "" || href.startsWith("#") || href.startsWith("mailto:")) return null;
			if (href.startsWith("file:")) try {
				return decodeURIComponent(href.replace(/^file:\/\//, "").replace(/^\/([A-Za-z]:)/, "$1"));
			} catch {
				return null;
			}
			if (ABS_PATH.test(href) || REL_PATH.test(href)) return href;
			if (!href.includes("://") && href.includes("/") && !href.startsWith("//")) return href;
			return null;
		}
		/**
		* Install a capture-phase click interceptor while settings allow it.
		* @returns disposer.
		*/
		function installOpenLinksInterceptor(scope) {
			const onClick = (event) => {
				const snap = scope.getSnapshot();
				if (snap.status !== "ready" || snap.value?.openLinksInEditor !== true) return;
				const target = event.target;
				if (!(target instanceof Element)) return;
				const anchor = target.closest("a");
				if (!(anchor instanceof HTMLAnchorElement)) return;
				const path = candidateFromAnchor(anchor);
				if (path === null) return;
				event.preventDefault();
				event.stopPropagation();
				requestOpenPath((ABS_PATH.test(path) ? path.replace(/^\/+/, "").replace(/^[A-Za-z]:[\\/]/, "") : path.replace(/^\.\//, "")).replaceAll("\\", "/"));
				window.dispatchEvent(new CustomEvent("file-explorer:focus-view"));
			};
			document.addEventListener("click", onClick, true);
			return () => document.removeEventListener("click", onClick, true);
		}
		//#endregion
		//#region lib/types/client/session-pin.js
		/**
		* Keep the explorer rooted at the CURRENT SESSION's OWN folder.
		*
		* A session is the user's unit of work — a sub-workspace — so its file view
		* shows the session's files, not everything the workspace holds. The mapping
		* is durable (`<workspace>/.dsh/session-dirs.json`) and keyed by session id,
		* so two sessions sharing a title get `标题` / `标题-2` rather than a
		* collision. The workspace itself stays one click away in the picker.
		*
		* The host is handed the WORKSPACE as the anchor, never the live root:
		* once the pin applies, the root IS the session folder, so anchoring on
		* it would mint a nested family of folders on every sync.
		*
		* The session id — and its row (cwd) — come from the VIEW'S OWN PROPS, not
		* from a service walk. The host hands every `conversation.view` occupant both
		* the session id and a `useSessions` selector bound to the session list,
		* which is the only trustworthy source here: this build's `sessions.list`
		* snapshot carries `ids` / `byId` / `phase` / `projectionsBySession` and NO
		* `current` field, so a plugin reading that store cannot tell which session
		* is open — and this plugin never declares `sessions` as a dependency, so
		* `ctx.sessions` throws.
		* @param sessionId - the session this view renders, straight from slot props.
		* @param sessionCwd - that session's workspace folder, from the list row.
		* @param api - the explorer RPC facade.
		* @param reload - re-read the tree after the root moves.
		* @param onResolved - told which folder now belongs to this session (empty
		*   string when it could not be resolved, which is when the ownership
		*   strip hides) together with the session's file counts, so the panel can
		*   say what the tree is and what is in it instead of leaving the user to
		*   infer both from a path.
		* @returns a stable `holdPin()`; call it before a hand-driven root switch so
		*   the folder the user opened survives later session-list updates.
		*/
		function useSessionRootPin(sessionId, sessionCwd, sessionTitle, api, reload, onResolved) {
			/*
			 * The callback is re-created on every panel render, so it lives in a ref:
			 * listing it as an effect dependency would re-run the pin (and re-mint
			 * the folder map) on every keystroke elsewhere in the panel.
			 */
			const notify = (0, react.useRef)(onResolved);
			notify.current = onResolved;
			/* Session-scoped pin state. `hold` survives title updates but resets when
			 * the session changes, so browsing away is sticky for as long as that
			 * session is open. */
			const state = (0, react.useRef)({
				sessionId: "",
				applied: "",
				hold: false
			});
			/** Invalidates in-flight work when the session changes or we unmount. */
			const gen = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				const st = state.current;
				if (st.sessionId !== sessionId) {
					st.sessionId = sessionId;
					st.applied = "";
					st.hold = false;
					notify.current?.("");
				}
				if (typeof sessionId !== "string" || sessionId === "" || sessionCwd === "" || st.hold) return void 0;
				const mine = ++gen.current;
				void (async () => {
					/* The session folder is minted on first open and reused after that. */
					let target = sessionCwd;
					const minted = await api.resolveSessionDir(sessionId, sessionTitle, sessionCwd);
					if (minted.ok) target = minted.value.path;
					else console.warn("[dsh-vscode] session folder unavailable:", minted.error.message);
					if (mine !== gen.current || state.current.hold) return;
					notify.current?.(minted.ok ? minted.value.path : "", null);
					/*
					* Compare against what the PIN applied rather than against the live
					* root, so a folder the user opened by hand is left alone until the
					* session's own folder really changes — which in practice means the
					* moment its title arrives and the folder gets named after it.
					*/
					const key = `${sessionId}|${target}`;
					if (state.current.applied === key) return;
					state.current.applied = key;
					/*
					* Gather this session's own files into its folder BEFORE the tree
					* reads it, so the folder never paints as an empty shell and then
					* fills in a beat later. Cheap to repeat: extraction is cached
					* against the transcript's size + mtime.
					*/
					const collected = await api.sessionFiles(sessionId, sessionCwd);
					if (mine !== gen.current || state.current.hold) return;
					notify.current?.(target, collected.ok ? collected.value : null);
					const result = await api.setRoot(target);
					if (mine !== gen.current || !result.ok) return;
					reload();
					window.dispatchEvent(new CustomEvent("file-explorer:root-changed", { detail: {
						root: result.value.root,
						sessionId
					} }));
				})();
				return () => {
					gen.current++;
				};
			}, [
				sessionId,
				sessionCwd,
				sessionTitle,
				api,
				reload
			]);
			return (0, react.useCallback)(() => {
				state.current.hold = true;
			}, []);
		}
		//#endregion
		//#region \0dsh-css:/Users/hivanpan/Hivan/project/ykl/project/Whale/whale-harness-free/plugins/packages/ui/dsh-plugin-file-explorer/src/client/files-view.module.css.mjs
		const css = "._5j-Hiq_shell{width:100%;height:100%;min-height:0;position:relative;overflow:hidden}._5j-Hiq_filesView{box-sizing:border-box;background:var(--dsw-alias-bg-layer-1);width:100%;min-height:0;color:var(--dsw-alias-label-primary);display:flex;position:absolute;inset:0;overflow:hidden}._5j-Hiq_treeCol{border-right:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);flex-shrink:0;min-width:160px;max-width:70%;min-height:0;position:relative;overflow:hidden}._5j-Hiq_treeResize{z-index:2;cursor:col-resize;touch-action:none;width:6px;height:100%;position:absolute;top:0;right:-3px}._5j-Hiq_treeResize:hover,._5j-Hiq_treeResize:active{background:color-mix(in srgb, var(--dsw-alias-brand-primary,#4c8bf5) 35%, transparent)}._5j-Hiq_editorCol{flex-direction:column;flex:1;min-width:0;min-height:0;display:flex;overflow:hidden}._5j-Hiq_crash{color:var(--dsw-alias-label-danger,#c62828);padding:16px;font-size:13px}._5j-Hiq_quickOverlay{z-index:30;background:color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent);justify-content:center;align-items:flex-start;padding-top:56px;display:flex;position:absolute;inset:0}._5j-Hiq_quickBox{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);width:min(620px,82%);max-height:60%;box-shadow:0 16px 40px color-mix(in srgb,var(--dsw-alias-label-primary) 22%,transparent);border-radius:10px;flex-direction:column;display:flex;overflow:hidden}._5j-Hiq_quickInput{appearance:none;border:0;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;outline:none;padding:10px 12px}._5j-Hiq_quickList{flex:1;min-height:0;margin:0;padding:4px;list-style:none;overflow-y:auto}._5j-Hiq_quickRow{cursor:pointer;white-space:nowrap;border-radius:6px;align-items:baseline;gap:8px;padding:5px 8px;font-size:13px;display:flex}._5j-Hiq_quickRowActive{background:var(--dsw-alias-bg-layer-3)}._5j-Hiq_quickName{color:var(--dsw-alias-label-primary);flex-shrink:0}._5j-Hiq_quickDir{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-size:12px;overflow:hidden}._5j-Hiq_quickHit{color:var(--dsw-alias-brand-primary);background:0 0;font-weight:600}._5j-Hiq_quickHint{border-top:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);flex-shrink:0;padding:6px 10px;font-size:12px}";
		const tagId = "dsh-vscode/files-view.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-vscode";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var files_view_module_css_default = {
			"crash": "_5j-Hiq_crash",
			"editorCol": "_5j-Hiq_editorCol",
			"filesView": "_5j-Hiq_filesView",
			"quickBox": "_5j-Hiq_quickBox",
			"quickDir": "_5j-Hiq_quickDir",
			"quickHint": "_5j-Hiq_quickHint",
			"quickHit": "_5j-Hiq_quickHit",
			"quickInput": "_5j-Hiq_quickInput",
			"quickList": "_5j-Hiq_quickList",
			"quickName": "_5j-Hiq_quickName",
			"quickOverlay": "_5j-Hiq_quickOverlay",
			"quickRow": "_5j-Hiq_quickRow",
			"quickRowActive": "_5j-Hiq_quickRowActive",
			"shell": "_5j-Hiq_shell",
			"treeCol": "_5j-Hiq_treeCol",
			"treeResize": "_5j-Hiq_treeResize"
		};
		//#endregion
		//#region chrome.css — VS Code-flavoured chrome (host tab strip + explorer surfaces)
		/**
		* Chrome polish for two surfaces the plugin does not own outright.
		*
		* 1. The host occupant tab strip (the raw `对话 | 文件` pair in the middle
		*    column header). It ships as two unstyled buttons; we restyle them into
		*    editor tabs WITHOUT hiding or renaming anything, using class-SUFFIX
		*    selectors (`_tabs` / `_tabActive`) because the stems are hashed and
		*    change between DSH builds. Scoped under `[data-slot="conversation.header"]`
		*    so no other tab strip in the app is touched.
		* 2. The explorer's own tab strip / path bar / status line, nudged closer to
		*    VS Code. Scoped under `[data-file-explorer-panel]` and layered on top of
		*    the module CSS, so the original rules stay intact for rollback.
		*
		* Every colour goes through a `--dsw-alias-*` token with a light-theme
		* fallback, so this tracks light/dark automatically.
		*/
		const chromeCss = `
[data-file-explorer-view] {
	container: dsh-vscode-ide / inline-size;
}
[data-file-explorer-view] [class*="_filesView"] {
	padding-bottom: 24px;
}
/* When DSH's right sidebar leaves little room, use the Explorer as a drawer. */
@container dsh-vscode-ide (max-width: 720px) {
	[data-file-explorer-view] [class*="_treeCol"] {
		position: absolute;
		left: 44px;
		top: 0;
		bottom: 24px;
		z-index: 8;
		width: min(280px, calc(100% - 44px)) !important;
		max-width: none;
		box-shadow: 8px 0 22px color-mix(in srgb, #000 24%, transparent);
	}
	[data-file-explorer-view] [class*="_treeResize"] {
		display: none;
	}
}
[data-file-explorer-view] .vscodeActivityBar {
	box-sizing: border-box;
	width: 44px;
	flex: 0 0 44px;
	display: flex;
	flex-direction: column;
	align-items: stretch;
	gap: 2px;
	padding-top: 5px;
	border-right: 1px solid var(--dsw-alias-border-l2);
	background: var(--dsw-alias-bg-layer-2);
}
[data-file-explorer-view] .vscodeActivityButton {
	appearance: none;
	position: relative;
	display: grid;
	place-items: center;
	width: 44px;
	height: 44px;
	border: 0;
	background: transparent;
	color: var(--dsw-alias-label-secondary);
	cursor: pointer;
}
[data-file-explorer-view] .vscodeActivityButton:hover,
[data-file-explorer-view] .vscodeActivityButton:focus-visible {
	color: var(--dsw-alias-label-primary);
	background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
}
[data-file-explorer-view] .vscodeActivityButton:focus-visible {
	outline: 1px solid var(--dsw-alias-brand-primary);
	outline-offset: -2px;
}
[data-file-explorer-view] .vscodeActivityButton[aria-pressed="true"] {
	color: var(--dsw-alias-label-primary);
}
[data-file-explorer-view] .vscodeActivityButton[aria-pressed="true"]::before {
	content: "";
	position: absolute;
	top: 8px;
	bottom: 8px;
	left: 0;
	width: 2px;
	background: var(--dsw-alias-brand-primary);
}
[data-file-explorer-view] .vscodeActivityButton svg {
	width: 21px;
	height: 21px;
}
[data-slot="conversation.header"] div[class*="_tabs"] {
	display: none !important;
}

/* ---- explorer: our own view switch (replaces the hidden host tab strip) ---- */
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch {
	display: inline-flex;
	align-items: center;
	gap: 2px;
	padding: 2px;
	border-radius: 9px;
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 5%, transparent);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button {
	appearance: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	height: 26px;
	padding: 0 10px;
	border: 1px solid transparent;
	border-radius: 7px;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font: inherit;
	font-size: 12.5px;
	font-weight: 500;
	line-height: 1;
	cursor: pointer;
	transition: background-color .14s ease, color .14s ease, box-shadow .14s ease;
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button[data-active="true"] {
	color: var(--dsw-alias-label-primary, #0f1115);
	font-weight: 600;
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: 0 1px 2px rgba(15, 17, 21, .08);
}
[data-slot="conversation.session.header.utilities"] .explorerViewSwitch button svg {
	width: 14px;
	height: 14px;
	flex-shrink: 0;
}

/* ---- explorer: editor tab strip ---- */
[data-file-explorer-view] .VX-wEW_tabs {
	align-items: stretch;
	gap: 0;
	min-height: 36px;
	padding: 0;
	background: var(--dsw-alias-bg-layer-2);
	border-bottom: 1px solid var(--dsw-alias-border-l2);
}
[data-file-explorer-view] .VX-wEW_tab {
	gap: 6px;
	max-width: 220px;
	min-width: 92px;
	min-height: 35px;
	padding: 0 12px;
	border: 0;
	border-right: 1px solid var(--dsw-alias-border-l2);
	border-radius: 0;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font-size: 12.5px;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .VX-wEW_tab:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 6%, transparent);
}
[data-file-explorer-view] .VX-wEW_tabActive {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: inset 0 1px 0 var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-view] .VX-wEW_tab .VX-wEW_closeBtn {
	opacity: 0;
}
[data-file-explorer-view] .VX-wEW_tab:hover .VX-wEW_closeBtn,
[data-file-explorer-view] .VX-wEW_tabActive .VX-wEW_closeBtn,
[data-file-explorer-view] .VX-wEW_closeBtn:focus-visible {
	opacity: .8;
}
[data-file-explorer-view] .vscodeTabLabel {
	display: inline-flex;
	align-items: baseline;
	gap: 5px;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .vscodeTabContext {
	color: var(--dsw-alias-label-secondary, #858b91);
	font-size: 11px;
	font-weight: 400;
}
[data-file-explorer-view] .vscodeFileIcon {
	box-sizing: border-box;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: 0 0 16px;
	width: 16px;
	height: 16px;
	border-radius: 3px;
	background: color-mix(in srgb, currentColor 15%, transparent);
	font: 700 9px/1 ui-monospace, Consolas, monospace;
	letter-spacing: -.5px;
}
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="ts"] { color: #4ca7ed; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="js"] { color: #d4bb54; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="json"] { color: #a9c474; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="md"] { color: #a58cdd; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="css"] { color: #7bb1eb; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="html"] { color: #dd9065; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="yaml"] { color: #ba88a4; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="py"] { color: #c7ae71; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="go"] { color: #6ec3c3; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="rs"] { color: #c89b7a; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="shell"] { color: #9bbe8a; }
[data-file-explorer-view] .vscodeFileIcon[data-file-kind="file"] { color: var(--dsw-alias-label-secondary, #858b91); }
[data-file-explorer-panel] [role="treeitem"] {
	min-width: 100%;
}
[data-file-explorer-panel] [role="treeitem"] .t3VzRa_icon {
	color: #d6ae6a;
}
[data-file-explorer-panel] [role="treeitem"][data-active-file="true"]:not([aria-selected="true"]) {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 10%, transparent);
}
[data-file-explorer-panel] [role="treeitem"][data-active-file="true"] .t3VzRa_label {
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-view] .VX-wEW_toolbar {
	min-height: 30px;
	gap: 4px;
	padding: 2px 8px;
}
[data-file-explorer-view] .VX-wEW_toolBtn {
	border-color: transparent;
	border-radius: 3px;
	background: transparent;
	padding: 3px 7px;
}
[data-file-explorer-view] .VX-wEW_toolBtn:hover,
[data-file-explorer-view] .VX-wEW_toolBtn:focus-visible {
	border-color: transparent;
	background: var(--dsw-alias-bg-layer-3);
}

/* ---- explorer: breadcrumb path bar (now clickable segments) ---- */
[data-file-explorer-view] .VX-wEW_pathBar {
	display: flex;
	align-items: center;
	gap: 1px;
	padding: 0 8px;
	min-height: 28px;
	font-size: 12px;
	justify-content: flex-start;
}
[data-file-explorer-view] .VX-wEW_pathBar > span {
	display: inline-flex;
	align-items: center;
	min-width: 0;
	flex-shrink: 1;
	overflow: hidden;
	text-overflow: ellipsis;
}
[data-file-explorer-view] .VX-wEW_pathBar .vscodeCrumbFile {
	flex-shrink: 0;
	gap: 5px;
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-view] .VX-wEW_pathBar button {
	appearance: none;
	border: 1px solid transparent;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
	max-width: 220px;
	padding: 2px 6px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-view] .VX-wEW_pathBar button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-file-explorer-view] .VX-wEW_pathBar .crumbSep {
	opacity: .45;
	padding: 0 1px;
	user-select: none;
}

/* ---- explorer: VS Code-flavoured status bar ---- */
[data-file-explorer-view] .editorStatusBar {
	display: flex;
	align-items: center;
	gap: 12px;
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 10;
	height: 24px;
	padding: 0 10px;
	background: #007acc;
	color: #fff;
	font-size: 11.5px;
	font-variant-numeric: tabular-nums;
}
[data-file-explorer-view] .editorStatusBar .statusItem {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}
[data-file-explorer-view] .editorStatusBar .statusDirty {
	color: #fff;
	font-weight: 600;
}

/* ---- explorer: tree breadcrumb + workspace switcher ---- */
[data-file-explorer-panel] .treeCrumbs {
	display: flex;
	align-items: center;
	gap: 1px;
	min-height: 26px;
	padding: 0 8px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
	background: var(--dsw-alias-bg-layer-2);
	color: var(--dsw-alias-label-secondary, #61666b);
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 11.5px;
	line-height: 1.4;
	white-space: nowrap;
	overflow: hidden;
}
[data-file-explorer-panel] .treeCrumbs button {
	appearance: none;
	border: 1px solid transparent;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
	max-width: 200px;
	padding: 2px 6px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-panel] .treeCrumbs button:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
[data-file-explorer-panel] .treeCrumbs .crumbSep {
	opacity: .45;
	padding: 0 1px;
	user-select: none;
	flex-shrink: 0;
}

/* ---- explorer: which session this tree belongs to ----
 * The pin silently roots the tree at the session's own folder, which is
 * correct but invisible: the user sees a path and has to trust that it is
 * theirs. This strip states the ownership and offers the one jump that
 * matters — back to the folder this session holds, or out to the workspace.
 */
[data-file-explorer-panel] .sessionStrip {
	display: flex;
	align-items: center;
	gap: 6px;
	min-height: 24px;
	padding: 0 8px;
	border-bottom: 1px solid var(--dsw-alias-border-l2);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 9%, transparent);
	color: var(--dsw-alias-label-secondary, #61666b);
	font-size: 11.5px;
	white-space: nowrap;
	overflow: hidden;
}
[data-file-explorer-panel] .sessionStripBadge {
	flex-shrink: 0;
	padding: 1px 6px;
	border-radius: 999px;
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 22%, transparent);
	color: var(--dsw-alias-label-primary, #0f1115);
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: .3px;
}
[data-file-explorer-panel] .sessionStripName {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--dsw-alias-label-primary, #0f1115);
}
[data-file-explorer-panel] .sessionStripFiles {
	flex-shrink: 0;
	opacity: .78;
	font-variant-numeric: tabular-nums;
}
[data-file-explorer-panel] .sessionStripJump {
	appearance: none;
	flex-shrink: 0;
	padding: 1px 7px;
	border: 1px solid var(--dsw-alias-border-l2);
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	cursor: pointer;
}
[data-file-explorer-panel] .sessionStripJump:hover {
	color: var(--dsw-alias-label-primary, #0f1115);
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 45%, transparent);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 14%, transparent);
}

/* ---- explorer: tree toolbar workspace switcher ---- */
[data-file-explorer-panel] .workspacePicker {
	appearance: none;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: 100%;
	padding: 3px 8px;
	border: 1px solid transparent;
	border-radius: 7px;
	background: transparent;
	color: inherit;
	font: inherit;
	font-size: 12.5px;
	font-weight: 600;
	cursor: pointer;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
[data-file-explorer-panel] .workspacePicker:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent);
}
[data-file-explorer-panel] .workspaceMenu {
	z-index: 30;
	position: absolute;
	top: calc(100% + 6px);
	left: 4px;
	min-width: 240px;
	max-width: 460px;
	max-height: 320px;
	overflow-y: auto;
	display: flex;
	flex-direction: column;
	gap: 2px;
	padding: 6px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	border-radius: 10px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	box-shadow: 0 10px 28px color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 14%, transparent);
}
[data-file-explorer-panel] .workspaceMenuItem {
	appearance: none;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 2px;
	width: 100%;
	padding: 6px 8px;
	border: 0;
	border-radius: 7px;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
}
[data-file-explorer-panel] .workspaceMenuItem:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 8%, transparent);
}
/* PATCH(2026-10-13): the workspace the explorer is currently rooted at. */
[data-file-explorer-panel] .workspaceMenuItem[data-current="true"] {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 12%, transparent);
}
[data-file-explorer-panel] .workspaceMenuItem[data-current="true"] .workspaceMenuLabel {
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
/* PATCH(2026-10-13): leading tick + trailing section label on the "open another" row. */
[data-file-explorer-panel] .workspaceMenuLabel {
	display: flex;
	align-items: center;
	gap: 6px;
	font-size: 12.5px;
	font-weight: 600;
}
[data-file-explorer-panel] .workspaceMenuCheck {
	flex-shrink: 0;
	width: 12px;
	font-size: 11px;
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-panel] .workspaceMenuSection {
	margin-left: auto;
	font-size: 11px;
	font-weight: 500;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-panel] .workspaceMenuHint {
	padding: 6px 8px;
	font-size: 12px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
/* ---- editor subagent seat (PATCH 2026-10-13) ---- */
[data-file-explorer-view] [class*="_editorCol"] > *:first-child {
	flex: 1 1 0%;
	min-height: 0;
}
[data-file-explorer-view] .eaPanel {
	flex-shrink: 0;
	position: relative;
	display: flex;
	flex-direction: column;
	min-height: 0;
	border-top: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	background: var(--dsw-alias-bg-layer-2, #fafafa);
}
[data-file-explorer-view] .eaResize {
	position: absolute;
	top: -3px;
	left: 0;
	right: 0;
	height: 6px;
	z-index: 5;
	cursor: row-resize;
	touch-action: none;
}
[data-file-explorer-view] .eaResize:hover,
[data-file-explorer-view] .eaResize:active {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 35%, transparent);
}
[data-file-explorer-view] .eaHead {
	display: flex;
	align-items: center;
	gap: 4px;
	flex-shrink: 0;
	padding: 2px 6px 2px 2px;
}
[data-file-explorer-view] .eaToggle {
	appearance: none;
	display: flex;
	align-items: center;
	gap: 6px;
	flex: 1;
	min-width: 0;
	padding: 4px 6px;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font: inherit;
	text-align: left;
	cursor: pointer;
}
[data-file-explorer-view] .eaToggle:hover {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 7%, transparent);
}
[data-file-explorer-view] .eaChevron {
	flex-shrink: 0;
	width: 10px;
	font-size: 10px;
	opacity: .6;
}
[data-file-explorer-view] .eaTitle {
	flex-shrink: 0;
	font-size: 12px;
	font-weight: 600;
}
[data-file-explorer-view] .eaModel {
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 11px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaActions {
	display: flex;
	align-items: center;
	gap: 2px;
	flex-shrink: 0;
}
[data-file-explorer-view] .eaIconBtn {
	appearance: none;
	width: 22px;
	height: 22px;
	display: grid;
	place-items: center;
	border: 0;
	border-radius: 6px;
	background: transparent;
	color: inherit;
	font-size: 12px;
	line-height: 1;
	cursor: pointer;
}
[data-file-explorer-view] .eaIconBtn:hover:not(:disabled) {
	background: color-mix(in srgb, var(--dsw-alias-label-primary, #0f1115) 9%, transparent);
}
[data-file-explorer-view] .eaIconBtn:disabled {
	opacity: .35;
	cursor: default;
}
[data-file-explorer-view] .eaBody {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 6px;
	min-height: 0;
	padding: 0 8px 8px;
}
[data-file-explorer-view] .eaTabs {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
	overflow-x: auto;
}
[data-file-explorer-view] .eaTab {
	appearance: none;
	flex-shrink: 0;
	padding: 3px 9px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .1));
	border-radius: 999px;
	background: transparent;
	color: var(--dsw-alias-label-secondary, #61666b);
	font: inherit;
	font-size: 11px;
	cursor: pointer;
}
[data-file-explorer-view] .eaTab[data-active="true"] {
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 55%, transparent);
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 12%, transparent);
	color: var(--dsw-alias-brand-primary, #4c8bf5);
	font-weight: 600;
}
[data-file-explorer-view] .eaLog {
	display: flex;
	flex-direction: column;
	flex: 1;
	gap: 8px;
	min-height: 0;
	padding: 2px;
	overflow-y: auto;
}
[data-file-explorer-view] .eaEmpty {
	padding: 10px 6px;
	font-size: 12px;
	line-height: 1.6;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaMsg {
	display: flex;
	flex-direction: column;
	gap: 3px;
	max-width: 100%;
}
[data-file-explorer-view] .eaWho {
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: .02em;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaText {
	padding: 6px 9px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .08));
	border-radius: 8px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	font-size: 12.5px;
	line-height: 1.6;
	white-space: pre-wrap;
	word-break: break-word;
}
[data-file-explorer-view] .eaMsgUser .eaText {
	background: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 9%, var(--dsw-alias-bg-layer-1, #fff));
}
[data-file-explorer-view] .eaMsgMain .eaText {
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 40%, var(--dsw-alias-border-l2, rgba(0, 0, 0, .08)));
}
[data-file-explorer-view] .eaMsgMain .eaWho {
	color: var(--dsw-alias-brand-primary, #4c8bf5);
}
[data-file-explorer-view] .eaTyping {
	padding: 4px 2px;
	font-size: 12px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-view] .eaError {
	flex-shrink: 0;
	padding: 5px 8px;
	border-radius: 6px;
	background: var(--dsw-alias-interactive-bg-hover-danger, rgba(198, 40, 40, .08));
	color: var(--dsw-alias-state-error-primary, #c62828);
	font-size: 11.5px;
	line-height: 1.5;
}
[data-file-explorer-view] .eaComposer {
	display: flex;
	align-items: flex-end;
	gap: 6px;
	flex-shrink: 0;
}
[data-file-explorer-view] .eaInput {
	flex: 1;
	min-width: 0;
	min-height: 48px;
	max-height: 160px;
	padding: 6px 8px;
	border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .12));
	border-radius: 8px;
	background: var(--dsw-alias-bg-layer-1, #fff);
	color: inherit;
	font: inherit;
	font-size: 12.5px;
	line-height: 1.5;
	resize: vertical;
}
[data-file-explorer-view] .eaInput:focus {
	outline: none;
	border-color: color-mix(in srgb, var(--dsw-alias-brand-primary, #4c8bf5) 60%, transparent);
}
[data-file-explorer-view] .eaSend {
	appearance: none;
	flex-shrink: 0;
	height: 30px;
	padding: 0 12px;
	border: 0;
	border-radius: 8px;
	background: var(--dsw-alias-brand-primary, #4c8bf5);
	color: #fff;
	font: inherit;
	font-size: 12px;
	font-weight: 600;
	cursor: pointer;
}
[data-file-explorer-view] .eaSend:disabled {
	opacity: .45;
	cursor: default;
}
[data-file-explorer-view] .eaHint {
	flex-shrink: 0;
	font-size: 10.5px;
	color: var(--dsw-alias-label-secondary, #61666b);
}
[data-file-explorer-panel] .workspaceMenuPath {
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
	font-size: 11px;
	color: var(--dsw-alias-label-secondary, #61666b);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 440px;
}
`;
		const chromeTagId = "dsh-vscode/chrome.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(chromeTagId) + "]") === null) {
			const chromeTag = document.createElement("style");
			chromeTag.dataset.plugin = "dsh-vscode";
			chromeTag.dataset.pluginCss = chromeTagId;
			chromeTag.textContent = chromeCss;
			document.head.appendChild(chromeTag);
		}
		//#endregion
		//#region lib/types/client/index.js
		/**
		* Client half: Files tab fills the conversation viewArea (composer-overlay
		* contract) with a center tree | editor split. Left sidebar stays the
		* official workspace / conversation list (no sidebar.workspaces shadow).
		*/
		const PACKAGE = "dsh-vscode";
		const VIEW_ID = "file-explorer";
		/**
		* PATCH(2026-10-13): id + kind of the explorer's right-Sidebar tab.
		*
		* The explorer used to occupy the middle column (`conversation.view`), which
		* forced DSH to render the 「对话 | 文件」switcher above the conversation. Only
		* ONE occupant means no switcher, so the explorer now lives in the right
		* Sidebar instead and the middle column stays a pure native conversation.
		*/
		const SIDEBAR_TAB_KIND = "dsh-vscode";
		/** Required client services before apply runs. */
		const inject = [
			"slots",
			"remote",
			"locale",
			"connection",
			"configForms"
		];
		/**
		* Mount remotes and register UI slots.
		* @param ctx - Client root context.
		*/
		async function apply(ctx) {
			try {
				return await applyInner(ctx);
			} catch (error) {
				console.error("[dsh-vscode] apply() threw:", error, error && error.stack);
				throw error;
			}
		}
		async function applyInner(ctx) {
			const disposeRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			ctx.effect(() => disposeRemote, "dsh-vscode: remote");
			ctx.effect(() => ctx.locale.register(NS, dictionaries), "dsh-vscode: dictionaries");
			const settings = ctx.configForms.get(FILE_EXPLORER_SETTINGS_NS);
			const tabs = new TabsStore();
			const buffers = new BuffersStore();
			const mdModes = new MdModeStore();
			const mode = new ExplorerModeStore();
			ctx.inject(["remote.explorerFs"], (remoteCtx) => {
				const api = createExplorerApi(remoteCtx);
				remoteCtx.effect(() => installOpenLinksInterceptor(settings), "dsh-vscode: open-links");
				remoteCtx.effect(() => {
					let disposeComposer;
					const syncComposer = () => {
						const enabled = mode.getSnapshot();
						if (disposeComposer !== void 0) {
							try {
								disposeComposer();
							} catch (error) {
								console.error("[dsh-vscode] composer dispose failed", error);
							}
							disposeComposer = void 0;
						}
						if (!enabled) return;
						try {
							disposeComposer = remoteCtx.effect(() => remoteCtx.slots.register({
								name: "conversation.composer",
								priority: 50,
								registrant: PACKAGE,
								select: () => ({ hide: true })
							}, () => null), "dsh-vscode: composer-hide");
						} catch (error) {
							console.error("[dsh-vscode] conversation.composer register failed", error);
						}
					};
					syncComposer();
					const unsub = mode.subscribe(syncComposer);
					return () => {
						unsub();
						if (disposeComposer !== void 0) {
							try {
								disposeComposer();
							} catch {}
							disposeComposer = void 0;
						}
					};
				}, "dsh-vscode: mode→composer");
				remoteCtx.slots.inject("conversation.view", () => remoteCtx.slots.register({
					name: "conversation.view",
					id: VIEW_ID,
					order: 40,
					locale: NS,
					label: () => explorerT(remoteCtx.locale.getSnapshot().active)("viewLabel"),
					registrant: PACKAGE
				}, (props) => (0, react_jsx_runtime.jsx)(FilesView, {
					ctx: remoteCtx,
					mode,
					api,
					tabs,
					buffers,
					mdModes,
					/*
					* Forward the host's own session bindings: `sessionId` says which
					* session this occupant renders, and `useSessions` is a selector hook
					* already bound to the session list store — the plugin cannot reach
					* that store any other way (it never injects `sessions`, and this
					* build's list snapshot has no `current` field).
					*/
					sessionId: props.sessionId,
					useSessions: props.useSessions
				})));
				/**
				* The 对话 / 文件 switch that replaces the (now hidden) host tab strip.
				* Lives in the session-header utilities zone so it sits next to the other
				* per-session actions instead of eating a row above the conversation.
				*/
				remoteCtx.slots.inject("conversation.session.header.utilities", () => remoteCtx.slots.register({
					name: "conversation.session.header.utilities",
					id: SIDEBAR_TAB_KIND,
					order: 20,
					registrant: PACKAGE
				}, () => (0, react_jsx_runtime.jsx)(ConversationViewSwitch, { ctx: remoteCtx })));
				remoteCtx.slots.inject("settings.plugins.tab", () => remoteCtx.slots.register({
					name: "settings.plugins.tab",
					id: FILE_EXPLORER_SETTINGS_NS,
					order: 30,
					label: () => explorerT(remoteCtx.locale.getSnapshot().active)("settingsTitle"),
					locale: NS,
					registrant: PACKAGE
				}, (props) => (0, react_jsx_runtime.jsx)("ul", {
					style: {
						listStyle: "none",
						margin: 0,
						padding: 0,
						display: "flex",
						flexDirection: "column",
						gap: 10
					},
					children: (0, react_jsx_runtime.jsx)(ExplorerSettingsCard, {
						ctx: remoteCtx,
						scope: settings,
						...props
					})
				})));
			});
		}
		var FilesViewBoundary = class extends react.Component {
			state = { message: null };
			static getDerivedStateFromError(error) {
				return { message: error.message };
			}
			componentDidCatch(error, info) {
				console.error("[dsh-vscode] FilesView crash", error, info);
			}
			render() {
				if (this.state.message !== null) return (0, react_jsx_runtime.jsx)("div", {
					className: files_view_module_css_default.shell,
					"data-file-explorer-view": "",
					"data-conversation-composer-overlay": "",
					children: (0, react_jsx_runtime.jsx)("div", {
						className: files_view_module_css_default.crash,
						children: this.state.message
					})
				});
				return this.props.children;
			}
		};
		const TREE_WIDTH_KEY = "dsh-vscode:tree-width";
		const TREE_WIDTH_DEFAULT = 256;
		const TREE_WIDTH_MIN = 160;
		const TREE_WIDTH_MAX = 720;
		/** Whether the file column is hidden (Ctrl+B, VSCode's sidebar toggle). */
		const TREE_HIDDEN_KEY = "dsh-vscode:tree-hidden";
		/** How many quick-open hits to render — more than this is unreadable. */
		const QUICK_MAX_RESULTS = 60;
		/** Reuse the quick-open walk for this long before walking again. */
		const QUICK_CACHE_MS = 30000;
		function readTreeHidden() {
			try {
				return window.localStorage.getItem(TREE_HIDDEN_KEY) === "1";
			} catch {
				return false;
			}
		}
		function writeTreeHidden(hidden) {
			try {
				window.localStorage.setItem(TREE_HIDDEN_KEY, hidden ? "1" : "0");
			} catch {}
		}
		/**
		* Rank one file against a quick-open query, VSCode-style: subsequence
		* matching with the score weighted by WHERE the match lands.
		*
		* Typing `sed` must find `src/editor/seed.ts`, and it must rank below a
		* file actually called `seed.ts` — which is why a match in the basename
		* scores far higher than one in a parent directory, and why a match on the
		* basename's first character beats one buried mid-name. Contiguous runs
		* win too: `abc` should prefer `abc.ts` over `a-b-c.ts`.
		* @returns `null` when the query is not a subsequence of the path.
		*/
		function quickScore(rel, query) {
			/*
			 * No query: rank by how shallow the path is. Plain alphabetical order
			 * buries `lib/index.js` under `lib/types/host/session-files.js`, and
			 * the shallow files are the ones people jump to.
			 */
			if (query === "") return 1 / (rel.length + 1);
			const haystack = rel.toLowerCase();
			const needle = query.toLowerCase();
			const slash = rel.lastIndexOf("/");
			const nameStart = slash + 1;
			let score = 0;
			let hay = 0;
			let previous = -2;
			for (let n = 0; n < needle.length; n++) {
				const found = haystack.indexOf(needle[n], hay);
				if (found < 0) return null;
				const inName = found >= nameStart;
				score += inName ? 10 : 1;
				/* Contiguous with the previous character. */
				if (found === previous + 1) score += 8;
				/* Starting a path segment or a camelCase word. */
				if (found === 0 || haystack[found - 1] === "/" || haystack[found - 1] === "-" || haystack[found - 1] === "_" || haystack[found - 1] === ".") score += 6;
				else if (n > 0 && /[A-Z]/.test(rel[found])) score += 4;
				hay = found + 1;
				previous = found;
			}
			/* A hit in the basename outranks any number of directory hits. */
			if (haystack.indexOf(needle) >= nameStart) score += 40;
			/* Prefer the shorter path when scores tie: `a/b.ts` over `a/x/y/b.ts`. */
			return score - rel.length / 100;
		}
		/** Filter + rank an index. An empty query lists the shallowest paths first. */
		function quickFilter(files, query) {
			const scored = [];
			for (const file of files) {
				const score = quickScore(file.rel, query);
				if (score !== null) scored.push({
					file,
					score
				});
			}
			scored.sort((a, b) => b.score - a.score || a.file.rel.localeCompare(b.file.rel));
			return scored.slice(0, QUICK_MAX_RESULTS).map((entry) => entry.file);
		}
		/** Highlight `query` inside `rel` as [before, hit, after] triples. */
		function quickHighlight(rel, query) {
			if (query === "") return [{
				text: rel,
				hit: false
			}];
			const haystack = rel.toLowerCase();
			const needle = query.toLowerCase();
			const parts = [];
			let cursor = 0;
			for (let n = 0; n < needle.length; n++) {
				const found = haystack.indexOf(needle[n], cursor);
				if (found < 0) break;
				if (found > cursor) parts.push({
					text: rel.slice(cursor, found),
					hit: false
				});
				parts.push({
					text: rel[found],
					hit: true
				});
				cursor = found + 1;
			}
			if (cursor < rel.length) parts.push({
				text: rel.slice(cursor),
				hit: false
			});
			return parts;
		}
		/**
		* Ctrl+P — jump to a file by typing part of its name.
		*
		* Deliberately a controlled overlay rather than anything the host owns:
		* the index comes from one `listFiles` call, the ranking is local, and
		* the list is short enough (60 rows) that rendering it is free. The
		* behaviour that matters and is easy to get wrong: focus lands in the
		* input on open, arrow keys move the selection WITHOUT leaving the input
		* (so typing continues to work), and the selected row always stays
		* scrolled into view.
		*/
		function QuickOpen(props) {
			const { t, state, onPick, onClose } = props;
			const [query, setQuery] = (0, react.useState)("");
			const [active, setActive] = (0, react.useState)(0);
			const inputRef = (0, react.useRef)(null);
			const listRef = (0, react.useRef)(null);
			const results = state.files === null ? [] : quickFilter(state.files, query);
			(0, react.useEffect)(() => {
				inputRef.current?.focus();
			}, []);
			/*
			 * Reset the selection when the result set changes shape. Keeping index
			 * 5 across a query that narrows to two rows would leave Enter opening
			 * nothing.
			 */
			(0, react.useEffect)(() => {
				setActive(0);
			}, [query]);
			const activeRow = Math.min(active, Math.max(0, results.length - 1));
			(0, react.useEffect)(() => {
				const list = listRef.current;
				if (list === null) return;
				const row = list.children[activeRow];
				if (row === void 0) return;
				const top = row.offsetTop;
				const bottom = top + row.offsetHeight;
				if (top < list.scrollTop) list.scrollTop = top;
				else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
			}, [activeRow, results.length]);
			const pick = (file) => {
				if (file === void 0) return;
				onPick(file.rel);
				onClose();
			};
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					onClose();
					return;
				}
				if (event.key === "ArrowDown" || event.key === "ArrowUp") {
					event.preventDefault();
					if (results.length === 0) return;
					const step = event.key === "ArrowDown" ? 1 : -1;
					setActive((current) => (current + step + results.length) % results.length);
					return;
				}
				if (event.key === "Enter") {
					event.preventDefault();
					pick(results[activeRow]);
					return;
				}
				/* Ctrl+P again cycles nothing; swallow it so the overlay stays put. */
				if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") event.preventDefault();
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: files_view_module_css_default.quickOverlay,
				"data-file-explorer-quick-open": state.files === null ? "loading" : "ready",
				onMouseDown: (event) => {
					/* A click on the backdrop dismisses; clicks inside do not. */
					if (event.target === event.currentTarget) onClose();
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: files_view_module_css_default.quickBox,
					children: [
						(0, react_jsx_runtime.jsx)("input", {
							ref: inputRef,
							className: files_view_module_css_default.quickInput,
							type: "text",
							value: query,
							placeholder: t("quickOpenPlaceholder"),
							spellCheck: false,
							autoComplete: "off",
							onChange: (event) => setQuery(event.target.value),
							onKeyDown
						}),
						state.error !== null ? (0, react_jsx_runtime.jsx)("div", {
							className: files_view_module_css_default.quickHint,
							children: state.error
						}) : (0, react_jsx_runtime.jsx)("ul", {
							ref: listRef,
							className: files_view_module_css_default.quickList,
							role: "listbox",
							children: results.map((file, index) => (0, react_jsx_runtime.jsxs)("li", {
								role: "option",
								"aria-selected": index === activeRow,
								className: index === activeRow ? `${files_view_module_css_default.quickRow} ${files_view_module_css_default.quickRowActive}` : files_view_module_css_default.quickRow,
								onMouseEnter: () => setActive(index),
								onMouseDown: (event) => {
									event.preventDefault();
									pick(file);
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: files_view_module_css_default.quickName,
									children: quickHighlight(file.name, query).map((part, partIndex) => part.hit ? (0, react_jsx_runtime.jsx)("mark", {
										className: files_view_module_css_default.quickHit,
										children: part.text
									}, partIndex) : (0, react_jsx_runtime.jsx)("span", {
										children: part.text
									}, partIndex))
								}), (0, react_jsx_runtime.jsx)("span", {
									className: files_view_module_css_default.quickDir,
									children: file.rel.includes("/") ? file.rel.slice(0, file.rel.lastIndexOf("/")) : ""
								})]
							}, file.rel))
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: files_view_module_css_default.quickHint,
							children: state.files === null ? t("quickOpenLoading") : results.length === 0 ? t("quickOpenNoMatch") : t("quickOpenCount").replace("{n}", String(results.length)).replace("{total}", String(state.total))
						})
					]
				})
			});
		}
		/**
		* How often the client asks the host what changed on disk.
		*
		* The agent writes files while the user watches, so this is the difference
		* between a live tree and a stale one. 2.5 s is a deliberate compromise:
		* the call is a tiny JSON round-trip and the host coalesces bursts, so the
		* cost is negligible next to the editor's own typing traffic.
		*/
		const WATCH_POLL_MS = 2500;
		function readTreeWidth() {
			try {
				const raw = window.localStorage.getItem(TREE_WIDTH_KEY);
				if (raw === null) return TREE_WIDTH_DEFAULT;
				const n = Number(raw);
				if (!Number.isFinite(n)) return TREE_WIDTH_DEFAULT;
				return Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, Math.round(n)));
			} catch {
				return TREE_WIDTH_DEFAULT;
			}
		}
		/**
		* Our own 对话 / 文件 switch — the replacement for the host tab strip.
		*
		* Why a proxy click instead of an API call: `selectView` belongs to
		* `ConversationSessionHeaderInjected`, which the host injects into its OWN
		* header entry. It is NOT part of the `conversation.session.header.utilities`
		* standard props (the catalog lists useResource/useChat/useInput/inputActions/
		* sessionId only), so a plugin cannot switch the middle-column view
		* programmatically. The host's tab buttons stay in the DOM — we hide only their
		* strip, via CSS — and a synthetic click on them flows through the host's own
		* handler. Active state is mirrored from the strip's `_tabActive` class with a
		* MutationObserver, so both directions stay in sync.
		*/
		function ConversationViewSwitch(props) {
			const { ctx } = props;
			const t = useExplorerT(ctx);
			const fileLabel = t("viewLabel");
			const chatLabel = t("viewChatLabel");
			const [active, setActive] = (0, react.useState)("chat");
			(0, react.useEffect)(() => {
				let frame = null;
				const read = () => {
					frame = null;
					const header = document.querySelector('[data-slot="conversation.header"]');
					if (header === null) return;
					const strip = header.querySelector('div[class*="_tabs"]');
					if (strip === null) return;
					const tabs = [...strip.querySelectorAll('button[role="tab"]')];
					const current = tabs.find((tab) => String(tab.className).includes("_tabActive"));
					if (current === undefined) return;
					const isFiles = (current.textContent || "").trim() !== chatLabel;
					setActive(isFiles ? "files" : "chat");
				};
				const schedule = () => {
					if (frame !== null) return;
					frame = window.requestAnimationFrame(read);
				};
				read();
				const observer = new MutationObserver(schedule);
				observer.observe(document.body, {
					subtree: true,
					attributes: true,
					attributeFilter: ["class"]
				});
				return () => {
					observer.disconnect();
					if (frame !== null) window.cancelAnimationFrame(frame);
				};
			}, [chatLabel]);
			const switchTo = (label) => {
				const header = document.querySelector('[data-slot="conversation.header"]');
				if (header === null) return;
				const strip = header.querySelector('div[class*="_tabs"]');
				if (strip === null) return;
				const tabs = [...strip.querySelectorAll('button[role="tab"]')];
				const target = label === "chat" ? tabs.find((tab) => (tab.textContent || "").trim() !== fileLabel) : tabs.find((tab) => (tab.textContent || "").trim() === fileLabel);
				if (target !== undefined) target.click();
			};
			const icon = (kind) => (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				"aria-hidden": "true",
				children: kind === "chat" ? [(0, react_jsx_runtime.jsx)("path", {
					d: "M21 12a8 8 0 0 1-8 8H8l-4 3v-4.4A8 8 0 0 1 13 4a8 8 0 0 1 8 8z"
				})] : [(0, react_jsx_runtime.jsx)("path", {
					d: "M3 7.5A2.5 2.5 0 0 1 5.5 5h3.1l1.7 2h8.2A2.5 2.5 0 0 1 21 9.5v7A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5z"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M8.5 13h7"
				})]
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "explorerViewSwitch",
				role: "group",
				"aria-label": fileLabel,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					title: chatLabel,
					"aria-label": chatLabel,
					"data-active": active === "chat" ? "true" : "false",
					onClick: () => switchTo("chat"),
					children: [icon("chat"), (0, react_jsx_runtime.jsx)("span", {
						children: chatLabel
					})]
				}), (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					title: fileLabel,
					"aria-label": fileLabel,
					"data-active": active === "files" ? "true" : "false",
					onClick: () => switchTo("files"),
					children: [icon("files"), (0, react_jsx_runtime.jsx)("span", {
						children: fileLabel
					})]
				})]
			});
		}
		//#region editor subagent panel (PATCH 2026-10-13)
		/** Expanded height of the subagent seat, remembered per browser. */
		const EA_HEIGHT_KEY = "dsh-vscode.subagentHeight";
		const EA_ACTIVE_KEY = "dsh-vscode.subagentActive";
		const EA_HEIGHT_DEFAULT = 240;
		const EA_HEIGHT_MIN = 120;
		const EA_HEIGHT_MAX = 560;
		function readEditorAgentHeight() {
			try {
				const raw = Number(window.localStorage.getItem(EA_HEIGHT_KEY));
				if (Number.isFinite(raw) && raw >= EA_HEIGHT_MIN && raw <= EA_HEIGHT_MAX) return raw;
			} catch {}
			return EA_HEIGHT_DEFAULT;
		}
		function readEditorAgentActive() {
			try {
				const raw = window.localStorage.getItem(EA_ACTIVE_KEY);
				return typeof raw === "string" && raw !== "" ? raw : null;
			} catch {
				return null;
			}
		}
		/**
		* The editor column's subagent seat.
		*
		* A subagent is a durable child assistant scoped to the open workspace. It
		* is deliberately NOT a second DSH session: the whole value of this seat is
		* that its memory is a plain workspace file, so the main agent above reads
		* it with an ordinary file read and steers it by appending to the inbox —
		* no private protocol, no second session to navigate to, and it lives
		* inside the editor the user is already looking at.
		*
		* The model always follows the open session (`modelSelection` projection),
		* passed down per call, so switching the main model switches this one too.
		*/
		function EditorAgentPanel(props) {
			const { ctx, api, sessionId } = props;
			const selectSession = props.useSessions ?? (() => void 0);
			const t = useExplorerT(ctx);
			const [open, setOpen] = (0, react.useState)(false);
			const [height, setHeight] = (0, react.useState)(readEditorAgentHeight);
			const [agents, setAgents] = (0, react.useState)([]);
			const [activeId, setActiveId] = (0, react.useState)(readEditorAgentActive);
			const [messages, setMessages] = (0, react.useState)([]);
			const [inbox, setInbox] = (0, react.useState)([]);
			const [draft, setDraft] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const scrollRef = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			/**
			* `useExplorerT` hands back a FRESH closure every render, so putting `t`
			* in a `useCallback` dependency list would rebuild the loader on every
			* render and make its effect re-run forever. Hold it in a ref instead:
			* the loaders stay identity-stable and read the current translations.
			*/
			const tRef = (0, react.useRef)(t);
			tRef.current = t;
			/**
			* Follow the open session's model, so switching the main model switches
			* this one too.
			*
			* `modelSelection` is a projection shaped `{ lastUsed, next }` — `next` is
			* the pair the main composer would send with, so prefer it and fall back
			* to `lastUsed`. It is read through the selector the host attaches to the
			* view props, NOT through `ctx.sessions`: this plugin never injects
			* `sessions`, and this build's list snapshot (`{ids, byId, phase,
			* projectionsBySession}`) has no `current` field to key off anyway.
			*
			* The cache keeps the snapshot identity stable across renders — returning
			* a fresh object every read would spin `useSyncExternalStore` forever.
			*/
			const modelCache = (0, react.useRef)({
				provider: "",
				model: ""
			});
			const selection = selectSession((list) => list?.byId?.[sessionId]?.projectionValues?.modelSelection);
			const picked = selection?.next ?? selection?.lastUsed;
			const sessionProvider = typeof picked?.provider === "string" ? picked.provider.trim() : "";
			const sessionModel = typeof picked?.model === "string" ? picked.model.trim() : "";
			const cached = modelCache.current;
			if (cached.provider !== sessionProvider || cached.model !== sessionModel) {
				modelCache.current = {
					provider: sessionProvider,
					model: sessionModel
				};
			}
			const model = modelCache.current;
			const loadAgents = (0, react.useCallback)(async () => {
				const result = await api.listEditorAgents();
				if (!result.ok) {
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				setError(null);
				setAgents(result.value.agents);
				/*
				* Reconcile the selection with what this root actually has.
				*
				* A remembered id can point at an agent that is gone — created while
				* the explorer was pinned to another folder, or removed outside the
				* panel. Keeping it makes the transcript load fail with a not-found
				* error on every mount, which reads like a broken feature. Fall back
				* to the newest agent instead; the tab strip only appears for two or
				* more, so without this a sole agent could never be selected at all.
				*/
				const remembered = readEditorAgentActive();
				const keep = remembered !== null && result.value.agents.some((agent) => agent.id === remembered);
				selectAgent(keep ? remembered : result.value.agents[0]?.id ?? null);
			}, [api]);
			const loadTranscript = (0, react.useCallback)(async (id) => {
				if (id === null || id === void 0) {
					setMessages([]);
					setInbox([]);
					return;
				}
				const result = await api.readEditorAgent(id);
				if (!result.ok) {
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				setError(null);
				setMessages(result.value.messages);
				setInbox(result.value.inbox);
			}, [api]);
			(0, react.useEffect)(() => {
				if (!open) return;
				void loadAgents();
			}, [open, loadAgents]);
			(0, react.useEffect)(() => {
				if (!open) return;
				void loadTranscript(activeId);
			}, [open, activeId, loadTranscript]);
			/* Switching the workspace root swaps the whole subagent set — reload. */
			(0, react.useEffect)(() => {
				const onRoot = () => {
					if (!open) return;
					void loadAgents();
					void loadTranscript(activeId);
				};
				window.addEventListener("file-explorer:root-changed", onRoot);
				return () => window.removeEventListener("file-explorer:root-changed", onRoot);
			}, [open, activeId, loadAgents, loadTranscript]);
			(0, react.useEffect)(() => {
				const node = scrollRef.current;
				if (node === null) return;
				node.scrollTop = node.scrollHeight;
			}, [messages, inbox, busy]);
			const selectAgent = (id) => {
				setActiveId(id);
				try {
					window.localStorage.setItem(EA_ACTIVE_KEY, id ?? "");
				} catch {}
			};
			const createAgent = async () => {
				setBusy(true);
				const result = await api.createEditorAgent("");
				setBusy(false);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				setAgents((list) => [result.value.agent, ...list]);
				selectAgent(result.value.agent.id);
			};
			const active = agents.find((agent) => agent.id === activeId) ?? null;
			const removeAgent = async () => {
				if (active === null) return;
				if (!window.confirm(t("subagentDeleteConfirm"))) return;
				setBusy(true);
				const result = await api.deleteEditorAgent(active.id);
				setBusy(false);
				if (!result.ok) {
					setError(describeRpcError(result.error, t));
					return;
				}
				setError(null);
				selectAgent(null);
				setAgents((list) => list.filter((agent) => agent.id !== active.id));
			};
			const send = async () => {
				const text = draft.trim();
				if (text === "" || busy) return;
				let id = activeId;
				if (id === null) {
					const created = await api.createEditorAgent("");
					if (!created.ok) {
						setError(describeRpcError(created.error, t));
						return;
					}
					id = created.value.agent.id;
					setAgents((list) => [created.value.agent, ...list]);
					selectAgent(id);
				}
				setDraft("");
				setBusy(true);
				setError(null);
				setMessages((list) => [...list, {
					role: "user",
					content: text,
					ts: ""
				}]);
				const result = await api.sendEditorAgent(id, text, model.provider, model.model);
				setBusy(false);
				if (!result.ok) {
					/*
					* Reload FIRST and set the error after: `loadTranscript` clears the
					* error on success, so the other order would swallow the failure
					* message the user needs to see.
					*/
					await loadTranscript(id);
					setError(describeRpcError(result.error, tRef.current));
					return;
				}
				await loadTranscript(id);
				void loadAgents();
			};
			const onResizeDown = (event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				dragRef.current = {
					startY: event.clientY,
					startHeight: height
				};
			};
			const onResizeMove = (event) => {
				const drag = dragRef.current;
				if (drag === null) return;
				setHeight(Math.min(EA_HEIGHT_MAX, Math.max(EA_HEIGHT_MIN, drag.startHeight - (event.clientY - drag.startY))));
			};
			const onResizeUp = (event) => {
				if (dragRef.current === null) return;
				dragRef.current = null;
				try {
					event.currentTarget.releasePointerCapture(event.pointerId);
				} catch {}
				setHeight((value) => {
					try {
						window.localStorage.setItem(EA_HEIGHT_KEY, String(value));
					} catch {}
					return value;
				});
			};
			const activeLabel = active === null ? t("subagentTitle") : active.name;
			const iconButton = (label, glyph, onClick, disabled) => (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: "eaIconBtn",
				title: label,
				"aria-label": label,
				disabled: disabled === true,
				onClick,
				children: glyph
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: "eaPanel",
				"data-open": open ? "true" : "false",
				style: open ? { height } : void 0,
				children: [open ? (0, react_jsx_runtime.jsx)("div", {
					className: "eaResize",
					title: t("subagentResize"),
					onPointerDown: onResizeDown,
					onPointerMove: onResizeMove,
					onPointerUp: onResizeUp,
					onPointerCancel: onResizeUp
				}) : null, (0, react_jsx_runtime.jsxs)("div", {
					className: "eaHead",
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "eaToggle",
						"aria-expanded": open ? "true" : "false",
						onClick: () => setOpen((value) => !value),
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: "eaChevron",
							children: open ? "▾" : "▸"
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "eaTitle",
							children: t("subagentTitle")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: "eaModel",
							title: model.model === "" ? t("subagentNoModel") : `${model.provider} · ${model.model}`,
							children: model.model === "" ? t("subagentNoModel") : model.model
						})]
					}), open ? (0, react_jsx_runtime.jsxs)("div", {
						className: "eaActions",
						children: [
							iconButton(t("subagentNew"), "＋", () => void createAgent(), false),
							iconButton(t("subagentDelete"), "🗑", () => void removeAgent(), active === null),
							iconButton(t("subagentRefresh"), "⟳", () => {
								void loadAgents();
								void loadTranscript(activeId);
							}, false)
						]
					}) : null]
				}), open ? (0, react_jsx_runtime.jsxs)("div", {
					className: "eaBody",
					children: [agents.length > 1 ? (0, react_jsx_runtime.jsx)("div", {
						className: "eaTabs",
						children: agents.map((agent) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "eaTab",
							"data-active": agent.id === activeId ? "true" : void 0,
							title: `${agent.id} · ${agent.messageCount}`,
							onClick: () => selectAgent(agent.id),
							children: agent.name
						}, agent.id))
					}) : null, (0, react_jsx_runtime.jsxs)("div", {
						className: "eaLog",
						ref: scrollRef,
						children: [agents.length === 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaEmpty",
							children: t("subagentEmpty")
						}) : null, agents.length > 0 && active === null ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaEmpty",
							children: t("subagentPick")
						}) : null, ...inbox.map((entry, index) => (0, react_jsx_runtime.jsxs)("div", {
							className: "eaMsg eaMsgMain",
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: "eaWho",
								children: t("subagentFromMain")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: "eaText",
								children: entry.content
							})]
						}, `inbox-${index}`)), ...messages.map((entry, index) => (0, react_jsx_runtime.jsxs)("div", {
							className: entry.role === "assistant" ? "eaMsg eaMsgAssistant" : "eaMsg eaMsgUser",
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: "eaWho",
								children: entry.role === "assistant" ? activeLabel : t("subagentYou")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: "eaText",
								children: entry.content
							})]
						}, `m-${index}`)), busy ? (0, react_jsx_runtime.jsx)("div", {
							className: "eaMsg eaMsgAssistant",
							children: (0, react_jsx_runtime.jsx)("div", {
								className: "eaTyping",
								children: t("subagentThinking")
							})
						}) : null]
					}), error !== null ? (0, react_jsx_runtime.jsx)("div", {
						className: "eaError",
						children: error
					}) : null, (0, react_jsx_runtime.jsxs)("div", {
						className: "eaComposer",
						children: [(0, react_jsx_runtime.jsx)("textarea", {
							className: "eaInput",
							value: draft,
							rows: 2,
							placeholder: t("subagentPlaceholder"),
							onChange: (event) => setDraft(event.target.value),
							onKeyDown: (event) => {
								if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
									event.preventDefault();
									void send();
								}
							}
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "eaSend",
							disabled: busy || draft.trim() === "",
							onClick: () => void send(),
							children: busy ? t("subagentSending") : t("subagentSend")
						})]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: "eaHint",
						children: t("subagentMemoryHint")
					})]
				}) : null]
			});
		}
		//#endregion
		/**
		* Files conversation view. The root MUST carry
		* `data-conversation-composer-overlay` so ConversationRoot stretches
		* `.viewArea`; without it the pane collapses to zero height.
		*/
		function EmptyEditorStatus({ tabs }) {
			const state = (0, react.useSyncExternalStore)(tabs.subscribe, tabs.getSnapshot);
			if (state.activePath !== null) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: "editorStatusBar",
				children: (0, react_jsx_runtime.jsx)("span", { className: "statusItem", children: "DSH" })
			});
		}
		function FilesView(props) {
			const { ctx, mode, api, tabs, buffers, mdModes, sessionId } = props;
			/**
			* The open session's list row, read through the selector the host ships
			* with the view props. Using the host's own binding is deliberate: this
			* plugin never injects `sessions`, so `ctx.sessions` throws, and this
			* build's list snapshot has no `current` field to key off anyway.
			*
			* Called unconditionally — React only cares that the call order is
			* stable, and the fallback keeps a hypothetical host without the prop
			* from crashing the view.
			*/
			const selectSession = props.useSessions ?? (() => void 0);
			const session = selectSession((list) => list?.byId?.[sessionId]);
			const sessionCwd = typeof session?.cwd === "string" ? session.cwd.trim() : "";
			const sessionTitle = typeof session?.title === "string" ? session.title.trim() : "";
			const t = useExplorerT(ctx);
			const [treeWidth, setTreeWidth] = (0, react.useState)(TREE_WIDTH_DEFAULT);
			const [treeCollapsed, setTreeCollapsed] = (0, react.useState)(readTreeHidden);
			/**
			* Quick-open state. `files === null` means "index not loaded yet" — the
			* overlay opens immediately on Ctrl+P and shows a loading line, because
			* waiting for a 20 000-entry walk before showing anything feels broken.
			*/
			const [quick, setQuick] = (0, react.useState)(null);
			/** Last completed quick-open walk, reused for QUICK_CACHE_MS. */
			const quickCache = (0, react.useRef)(null);
			const dragRef = (0, react.useRef)(null);
			const [external, setExternal] = (0, react.useState)(null);
			const watchRevision = (0, react.useRef)(0);
			/**
			* Poll the host change feed and publish one `external` batch per poll.
			*
			* `paths` is the raw set for the editor (open files), `dirs` adds each
			* path's parent so an expanded directory knows to re-list. The object is
			* replaced — never mutated — so consumers re-evaluate exactly once per
			* batch via a plain effect dependency.
			*/
			(0, react.useEffect)(() => {
				let cancelled = false;
				let timer = null;
				const tick = async () => {
					const result = await api.changes(watchRevision.current).catch(() => null);
					if (cancelled) return;
					if (result !== null && result.ok) {
						watchRevision.current = result.value.revision;
						if (result.value.paths.length > 0) {
							const paths = new Set(result.value.paths);
							const dirs = new Set();
							for (const path of paths) {
								dirs.add(path);
								const slash = path.lastIndexOf("/");
								dirs.add(slash === -1 ? "" : path.slice(0, slash));
							}
							setExternal({
								paths,
								dirs
							});
						}
					}
					if (!cancelled) timer = window.setTimeout(tick, WATCH_POLL_MS);
				};
				timer = window.setTimeout(tick, WATCH_POLL_MS);
				return () => {
					cancelled = true;
					if (timer !== null) window.clearTimeout(timer);
				};
			}, [api]);
			(0, react.useLayoutEffect)(() => {
				setTreeWidth(readTreeWidth());
			}, []);
			(0, react.useLayoutEffect)(() => {
				mode.setEnabled(true);
				return () => {
					mode.setEnabled(false);
				};
			}, [mode]);
			const onResizePointerDown = (0, react.useCallback)((event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				dragRef.current = {
					startX: event.clientX,
					startWidth: treeWidth
				};
			}, [treeWidth]);
			const onResizePointerMove = (0, react.useCallback)((event) => {
				const drag = dragRef.current;
				if (drag === null) return;
				const next = Math.min(TREE_WIDTH_MAX, Math.max(TREE_WIDTH_MIN, drag.startWidth + (event.clientX - drag.startX)));
				setTreeWidth(next);
			}, []);
			const onResizePointerUp = (0, react.useCallback)((event) => {
				if (dragRef.current === null) return;
				dragRef.current = null;
				try {
					event.currentTarget.releasePointerCapture(event.pointerId);
				} catch {}
				setTreeWidth((width) => {
					try {
						window.localStorage.setItem(TREE_WIDTH_KEY, String(width));
					} catch {}
					return width;
				});
			}, []);
			/** Double-click snaps the column back to its default width (VSCode habit). */
			const onResizeDoubleClick = (0, react.useCallback)(() => {
				setTreeWidth(TREE_WIDTH_DEFAULT);
				try {
					window.localStorage.setItem(TREE_WIDTH_KEY, String(TREE_WIDTH_DEFAULT));
				} catch {}
			}, []);
			const toggleTree = (0, react.useCallback)(() => {
				setTreeCollapsed((hidden) => {
					writeTreeHidden(!hidden);
					return !hidden;
				});
			}, []);
			/** Ctrl+Shift+E — put the caret in the tree so arrow keys work there. */
			const focusTree = (0, react.useCallback)(() => {
				setTreeCollapsed(false);
				writeTreeHidden(false);
				const root = document.querySelector("[data-file-explorer-view]");
				if (root === null) return;
				const focusRow = () => {
					const scroll = root.querySelector("[data-file-explorer-tree-scroll]");
					const row = scroll?.querySelector('[role="treeitem"][aria-selected="true"]') ?? scroll?.querySelector('[role="treeitem"]');
					if (row === void 0 || row === null) return false;
					row.focus();
					return document.activeElement === row;
				};
				if (focusRow()) return;
				const observer = new MutationObserver(() => {
					if (focusRow()) {
						observer.disconnect();
						window.clearTimeout(timeout);
					}
				});
				observer.observe(root, { childList: true, subtree: true });
				const timeout = window.setTimeout(() => {
					observer.disconnect();
					focusRow();
				}, 1500);
			}, []);
			const dropTabLocal = (0, react.useCallback)((path) => {
				tabs.close(path);
				buffers.drop(path);
				mdModes.drop(path);
			}, [
				buffers,
				mdModes,
				tabs
			]);
			/** Close the active tab, keeping the same dirty-check the ✕ uses. */
			const closeActiveTab = (0, react.useCallback)(() => {
				const active = tabs.getSnapshot().activePath;
				if (active === null) return;
				if (buffers.isDirty(active) && !window.confirm(t("confirmCloseDirty"))) return;
				dropTabLocal(active);
			}, [
				buffers,
				dropTabLocal,
				t,
				tabs
			]);
			/** Ctrl+Tab / Ctrl+PageDown cycle through open tabs, wrapping. */
			const cycleTab = (0, react.useCallback)((step) => {
				const snapshot = tabs.getSnapshot();
				const open = snapshot.open;
				if (open.length < 2) return;
				const index = open.findIndex((tab) => tab.path === snapshot.activePath);
				const next = index < 0 ? 0 : (index + step + open.length) % open.length;
				tabs.activate(open[next].path);
			}, [tabs]);
			const openQuickOpen = (0, react.useCallback)(async () => {
				const cached = quickCache.current;
				if (cached !== null && Date.now() - cached.at < QUICK_CACHE_MS) {
					setQuick({
						files: cached.files,
						total: cached.files.length,
						error: null
					});
					return;
				}
				setQuick({
					files: null,
					total: 0,
					error: null
				});
				const result = await api.listFiles("").catch(() => null);
				const next = result !== null && result.ok ? {
					files: result.value.files,
					total: result.value.files.length,
					error: null
				} : {
					files: [],
					total: 0,
					error: result === null ? t("quickOpenError") : describeRpcError(result.error, t)
				};
				if (next.files.length > 0) quickCache.current = {
					at: Date.now(),
					files: next.files
				};
				/* The overlay may have been dismissed while the walk was running. */
				setQuick((current) => current === null ? current : next);
			}, [
				api,
				t
			]);
			/**
			* VSCode muscle memory, in one place.
			*
			* Registered on `window` in the CAPTURE phase: Monaco stops propagation
			* for keys it owns, and a bubble-phase listener never sees Ctrl+P or
			* Ctrl+B once the editor has focus. Shift combinations are handled
			* first and everything else bails out on `shiftKey`, so Ctrl+Shift+F
			* (format) and Monaco's own Ctrl+Shift+* bindings stay untouched.
			*/
			(0, react.useEffect)(() => {
				const onKey = (event) => {
					if (!event.ctrlKey && !event.metaKey) return;
					const key = event.key.toLowerCase();
					if (event.shiftKey && key === "e") {
						event.preventDefault();
						focusTree();
						return;
					}
					if (event.key === "Tab" || event.key === "PageDown" || event.key === "PageUp") {
						event.preventDefault();
						const forward = event.key === "PageUp" || (event.key === "Tab" && event.shiftKey) ? -1 : 1;
						cycleTab(forward);
						return;
					}
					if (event.shiftKey || event.altKey) return;
					if (key === "b") {
						event.preventDefault();
						toggleTree();
						return;
					}
					if (key === "p") {
						event.preventDefault();
						void openQuickOpen();
						return;
					}
					if (key === "w") {
						event.preventDefault();
						closeActiveTab();
						return;
					}
					if (/^[1-9]$/.test(event.key)) {
						const open = tabs.getSnapshot().open;
						const target = open[Number(event.key) - 1];
						if (target === void 0) return;
						event.preventDefault();
						tabs.activate(target.path);
					}
				};
				window.addEventListener("keydown", onKey, true);
				return () => window.removeEventListener("keydown", onKey, true);
			}, [
				closeActiveTab,
				cycleTab,
				focusTree,
				openQuickOpen,
				tabs,
				toggleTree
			]);
			return (0, react_jsx_runtime.jsx)(FilesViewBoundary, { children: (0, react_jsx_runtime.jsx)("div", {
				className: files_view_module_css_default.shell,
				"data-file-explorer-view": "",
				"data-conversation-composer-overlay": "",
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: files_view_module_css_default.filesView,
					children: [(0, react_jsx_runtime.jsxs)("nav", {
						className: "vscodeActivityBar",
						"aria-label": "编辑器活动栏",
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "vscodeActivityButton",
							"aria-label": treeCollapsed ? "显示资源管理器" : "隐藏资源管理器",
							"aria-pressed": !treeCollapsed,
							title: "资源管理器 (Ctrl+B)",
							onClick: toggleTree,
							children: (0, react_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsx)("path", { d: "M5 3.5h9l4 4v12H5z", stroke: "currentColor", strokeWidth: 1.5, strokeLinejoin: "round" }), (0, react_jsx_runtime.jsx)("path", { d: "M14 3.5v4h4M8 12h7M8 15h7", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" })]
							})
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "vscodeActivityButton",
							"aria-label": "快速打开文件",
							title: "快速打开文件 (Ctrl+P)",
							onClick: () => void openQuickOpen(),
							children: (0, react_jsx_runtime.jsxs)("svg", {
								viewBox: "0 0 24 24",
								fill: "none",
								"aria-hidden": true,
								children: [(0, react_jsx_runtime.jsx)("circle", { cx: 10.5, cy: 10.5, r: 6, stroke: "currentColor", strokeWidth: 1.6 }), (0, react_jsx_runtime.jsx)("path", { d: "m15 15 5 5", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" })]
							})
						})]
					}), treeCollapsed ? null : (0, react_jsx_runtime.jsxs)("aside", {
						className: files_view_module_css_default.treeCol,
						style: { width: treeWidth },
						"aria-label": t("treeAriaLabel"),
					children: [(0, react_jsx_runtime.jsx)(ExplorerPanel, {
						ctx,
						api,
						tabs,
						external,
						sessionId,
						sessionCwd,
						sessionTitle,
						onOpenFile: (path) => {
							requestOpenPath(path);
							if ((document.querySelector('[data-file-explorer-view]')?.clientWidth ?? Infinity) <= 720) {
								setTreeCollapsed(true);
							}
						}
					})
					]}), treeCollapsed ? null : (0, react_jsx_runtime.jsx)("div", {
						/*
						* The drag handle lives in filesView, NOT inside treeCol.
						* treeCol clips overflow, so a handle overhanging its right
						* edge by 3px could never be hit — elementFromPoint on the
						* handle's centre returned the column itself and dragging
						* was dead in BOTH directions. Positioned here by `left`
						* it tracks the column edge and actually catches the press.
						*/
						className: files_view_module_css_default.treeResize,
						role: "separator",
						"aria-orientation": "vertical",
						"aria-valuenow": treeWidth,
						"aria-valuemin": TREE_WIDTH_MIN,
						"aria-valuemax": TREE_WIDTH_MAX,
						style: { left: 44 + Math.max(TREE_WIDTH_MIN, treeWidth) - 3, right: "auto" },
						onPointerDown: onResizePointerDown,
						onPointerMove: onResizePointerMove,
						onPointerUp: onResizePointerUp,
						onPointerCancel: onResizePointerUp,
						onDoubleClick: onResizeDoubleClick
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: files_view_module_css_default.editorCol,
						children: [(0, react_jsx_runtime.jsx)(EditorSurface, {
							ctx,
							api,
							tabs,
							buffers,
							mdModes,
							external
						}), (0, react_jsx_runtime.jsx)(EditorAgentPanel, {
							ctx,
							api,
							/*
							* The subagent seat follows the session's model, so it needs the
							* same host bindings the files view got: the session id and the
							* host's own list selector (`useSessions`).
							*/
							sessionId,
							useSessions: props.useSessions
						})]
					}), (0, react_jsx_runtime.jsx)(EmptyEditorStatus, { tabs }), quick === null ? null : (0, react_jsx_runtime.jsx)(QuickOpen, {
						t,
						state: quick,
						onPick: (rel) => {
							requestOpenPath(rel);
						},
						onClose: () => {
							setQuick(null);
						}
					})]
				})
			}) });
		}
		//#endregion
		exports.VIEW_ID = VIEW_ID;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map
