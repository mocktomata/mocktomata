"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Recorder_1 = require("./Recorder");
test('construct with no argument', function () {
    var recorder = new Recorder_1.Recorder('dummy plugin');
    recorder.newSpy();
    expect(recorder.actions).toEqual([
        {
            name: 'construct',
            plugin: 'dummy plugin',
            instanceId: 1,
            meta: undefined,
            payload: undefined
        }
    ]);
});
//# sourceMappingURL=Recorder.spec.js.map