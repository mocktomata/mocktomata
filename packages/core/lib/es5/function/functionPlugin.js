"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hasPropertyInPrototype_1 = require("../hasPropertyInPrototype");
var composeWithSubject_1 = require("./composeWithSubject");
exports.functionPlugin = {
    name: 'function',
    support: function (subject) {
        if (typeof subject !== 'function')
            return false;
        if (hasPropertyInPrototype_1.hasPropertyInPrototype(subject))
            return false;
        return true;
    },
    getSpy: function (context, subject) {
        var meta = {
            functionName: subject.name,
            properties: composeWithSubject_1.getPartialProperties(subject)
        };
        var spy = composeWithSubject_1.assignPropertiesIfNeeded(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var call = recorder.invoke(args);
            try {
                var result = subject.apply(this, call.spiedArgs);
                return call.return(result);
            }
            catch (err) {
                throw call.throw(err);
            }
        }, meta.properties);
        var recorder = context.newSpyRecorder(spy, meta);
        return spy;
    },
    getStub: function (context, subject) {
        var meta = {
            functionName: subject.name,
            properties: composeWithSubject_1.getPartialProperties(subject)
        };
        var stub = composeWithSubject_1.assignPropertiesIfNeeded(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var call = recorder.invoke(args);
            if (call.succeed()) {
                return call.result();
            }
            else {
                throw call.result();
            }
        }, meta.properties);
        var recorder = context.newStubRecorder(stub, meta);
        return stub;
    }
};
//# sourceMappingURL=functionPlugin.js.map