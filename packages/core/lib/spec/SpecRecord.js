"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plugin_1 = require("../plugin");
var errors_1 = require("./errors");
var isMismatchAction_1 = require("./isMismatchAction");
function createSpecRecordTracker(record) {
    return {
        getReference: function (plugin, target) {
            var ref = this.findReference(target) || String(record.refs.length + 1);
            record.refs.push({ ref: ref, plugin: plugin, target: target });
            return ref;
        },
        findReference: function (target) {
            var specRef = record.refs.find(function (ref) { return ref.target === target; });
            if (specRef)
                return specRef.ref;
            return undefined;
        },
        invoke: function (ref, args) {
            var _this = this;
            record.actions.push({
                type: 'invoke',
                ref: ref,
                payload: args.map(function (arg) { return _this.findReference(arg) || arg; })
            });
        },
        return: function (ref, result) {
            var payload = this.findReference(result) || result;
            record.actions.push({
                type: 'return',
                ref: ref,
                payload: payload
            });
        },
        throw: function (ref, err) {
            var payload = this.findReference(err) || err;
            record.actions.push({
                type: 'throw',
                ref: ref,
                payload: payload
            });
        },
        addAction: function (action) {
            record.actions.push(action);
        }
    };
}
exports.createSpecRecordTracker = createSpecRecordTracker;
function createSpecRecordValidator(id, loaded, record) {
    return {
        getReference: function (plugin, target) {
            var ref = this.findReference(target) || String(record.refs.length + 1);
            record.refs.push({ ref: ref, plugin: plugin, target: target });
            return ref;
        },
        findReference: function (target) {
            var specRef = record.refs.find(function (ref) { return ref.target === target; });
            if (specRef)
                return specRef.ref;
            return undefined;
        },
        resolveTarget: function (ref) {
            var specRef = record.refs.find(function (r) { return r.ref === ref; });
            if (specRef)
                return specRef.target;
            specRef = loaded.refs.find(function (r) { return r.ref === ref; });
            if (specRef) {
                var plugin = plugin_1.getPlugin(specRef.plugin);
                if (plugin && plugin.deserialize) {
                    return plugin.deserialize(specRef.target);
                }
                else {
                    return specRef.target;
                }
            }
            return undefined;
        },
        invoke: function (ref, args) {
            var _this = this;
            var action = {
                type: 'invoke',
                ref: ref,
                payload: args.map(function (arg) { return _this.findReference(arg) || arg; })
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        return: function (ref, result) {
            var payload = this.findReference(result) || result;
            var action = {
                type: 'return',
                ref: ref,
                payload: payload
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        throw: function (ref, err) {
            var payload = this.findReference(err) || err;
            var action = {
                type: 'throw',
                ref: ref,
                payload: payload
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        addAction: function (action) {
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        succeed: function () {
            var next = loaded.actions[record.actions.length];
            return next.type === 'return';
        },
        result: function () {
            var next = loaded.actions[record.actions.length];
            return this.resolveTarget(next.payload) || next.payload;
        }
    };
}
exports.createSpecRecordValidator = createSpecRecordValidator;
function validateAction(id, actualRecord, record, action) {
    var expected = actualRecord.actions[record.actions.length];
    if (isMismatchAction_1.isMismatchAction(action, expected)) {
        throw new errors_1.SimulationMismatch(id, expected, action);
    }
}
//# sourceMappingURL=SpecRecord.js.map