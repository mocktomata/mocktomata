"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var is_primitive_1 = __importDefault(require("is-primitive"));
var ramda_1 = __importDefault(require("ramda"));
var constants_1 = require("./constants");
function artifactify(original) {
    if (is_primitive_1.default(original)) {
        return Object.defineProperty(Object(original), constants_1.artifactKey, {
            enumerable: false,
            value: typeof original
        });
    }
    var type = Array.isArray(original) ? 'array' : 'object';
    var clone = ramda_1.default.clone(original);
    return new Proxy(clone, {
        get: function (obj, prop) {
            if (prop === constants_1.artifactKey)
                return type;
            var result = obj[prop];
            if (result === undefined ||
                result[constants_1.artifactKey])
                return result;
            var desc = Object.getOwnPropertyDescriptor(obj, prop);
            if (desc && !desc.writable)
                return result;
            return obj[prop] = artifactify(result);
        }
    });
}
exports.artifactify = artifactify;
function unartifactify(value) {
    if (value === undefined || value === null)
        return value;
    switch (value[constants_1.artifactKey]) {
        case 'string':
            return String(value);
        case 'boolean':
            // tslint:disable-next-line:triple-equals
            return value == true;
        case 'number':
            return Number(value);
        case 'array':
            return value.map(function (v) { return unartifactify(v); });
        case 'object':
            return ramda_1.default.map(unartifactify, value);
        default:
            if (Array.isArray(value)) {
                return value.map(function (v) { return unartifactify(v); });
            }
            // istanbul ignore next
            return value;
    }
}
exports.unartifactify = unartifactify;
//# sourceMappingURL=artifactify.js.map