"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Recorder = /** @class */ (function () {
    function Recorder(pluginName) {
        this.pluginName = pluginName;
        this.instanceIdMap = {};
        this.actions = [];
    }
    Recorder.prototype.newSpy = function (args, meta) {
        var instanceId = this.getNewInstanceId();
        this.actions.push({
            name: 'construct',
            plugin: this.pluginName,
            instanceId: instanceId,
            payload: args,
            meta: meta
        });
        return createSpyRecorder(this, instanceId);
    };
    Recorder.prototype.getNewInstanceId = function () {
        var count = this.instanceIdMap[this.pluginName] || 0;
        return this.instanceIdMap[this.pluginName] = count + 1;
    };
    return Recorder;
}());
exports.Recorder = Recorder;
function createSpyRecorder(recorder, instanceId) {
    var invokeId = 0;
    return {
        instance: function (args, meta) {
            return {};
        },
        invoke: function (args, meta) {
            recorder.actions.push({
                name: 'invoke',
                plugin: recorder.pluginName,
                instanceId: instanceId,
                invokeId: ++invokeId,
                payload: args,
                meta: meta
            });
            return {};
        },
        get: function (meta) { return; },
        set: function (value, meta) { return; }
    };
}
//# sourceMappingURL=Recorder.js.map