"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = require("@komondor-lab/plugin");
var satisfier_1 = require("satisfier");
var type_plus_1 = require("type-plus");
var constants_1 = require("./constants");
// export interface SpecActionWithSource extends SpecAction {
//   sourceType: string;
//   sourceInstanceId: number;
//   sourceInvokeId: number;
//   sourceSite: (string | number)[];
// }
function isMismatchAction(actual, expected) {
    return !satisfier_1.createSatisfier(createActionExpectation(expected)).test(actual);
}
exports.isMismatchAction = isMismatchAction;
function createActionExpectation(action) {
    return __assign({}, action, { payload: createExpectationValue(action.payload) });
}
function createExpectationValue(value) {
    if (value === null)
        return undefined;
    if (Array.isArray(value))
        return value.map(function (v) { return createExpectationValue(v); });
    if (typeof value === 'object') {
        return type_plus_1.reduceKey(value, function (p, k) {
            p[k] = createExpectationValue(p[k]);
            return p;
        }, {});
    }
    return value;
}
function makeSerializableActions(actions) {
    return actions.map(makeSerializableAction);
}
exports.makeSerializableActions = makeSerializableActions;
function makeSerializableAction(action) {
    var objRefs = [];
    if (action.payload) {
        if (action.payload instanceof Error) {
            return __assign({}, action, { payload: __assign({ message: action.payload.message }, action.payload, { prototype: 'Error' }) });
        }
        else {
            return __assign({}, action, { payload: serializeEntry(action.payload, objRefs) });
        }
        // else if (action.name === 'invoke') {
        //   const args: any[] = action.payload
        //   return {
        //     ...action,
        //     payload: args.map(arg => serializeEntry(arg, objRefs))
        //   }
        // }
    }
    return action;
}
exports.makeSerializableAction = makeSerializableAction;
function serializeEntry(value, objRefs) {
    if (value === undefined || value === null)
        return value;
    if (value[constants_1.artifactKey])
        return value;
    if (Array.isArray(value))
        return value.map(function (v) { return serializeEntry(v, objRefs); });
    if (typeof value === 'object') {
        var cirId = objRefs.findIndex(function (x) { return x === value; });
        if (cirId >= 0) {
            return "[circular:" + cirId + "]";
        }
    }
    var plugin = plugin_1.findPlugin(value);
    if (plugin && plugin.serialize) {
        var val = plugin.serialize(value);
        objRefs.push(val);
        return val;
    }
    if (typeof value === 'object') {
        objRefs.push(value);
        return Object.keys(value).reduce(function (p, key) {
            p[key] = serializeEntry(value[key], objRefs);
            return p;
        }, {});
    }
    return value;
}
//# sourceMappingURL=specAction.js.map