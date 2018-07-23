export class Recorder {
    constructor(pluginName) {
        this.pluginName = pluginName;
        this.instanceIdMap = {};
        this.actions = [];
    }
    newSpy(args, meta) {
        const instanceId = this.getNewInstanceId();
        this.actions.push({
            name: 'construct',
            plugin: this.pluginName,
            instanceId,
            payload: args,
            meta
        });
        return createSpyRecorder(this, instanceId);
    }
    getNewInstanceId() {
        const count = this.instanceIdMap[this.pluginName] || 0;
        return this.instanceIdMap[this.pluginName] = count + 1;
    }
}
function createSpyRecorder(recorder, instanceId) {
    let invokeId = 0;
    return {
        instance(args, meta) {
            return {};
        },
        invoke(args, meta) {
            recorder.actions.push({
                name: 'invoke',
                plugin: recorder.pluginName,
                instanceId,
                invokeId: ++invokeId,
                payload: args,
                meta
            });
            return {};
        },
        get(meta) { return; },
        set(value, meta) { return; }
    };
}
//# sourceMappingURL=Recorder.js.map