"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isPromise_1 = require("./isPromise");
exports.promisePlugin = {
    name: 'promise',
    support: isPromise_1.isPromise,
    getSpy: getPromiseSpy,
    getStub: getPromiseStub
};
function getPromiseSpy(context, subject) {
    var recorder = context.newSpyRecorder();
    var instance = recorder.construct();
    var call = instance.newCall();
    return subject.then(function (result) {
        return call.return(result, { state: 'fulfilled' });
    }, function (err) {
        throw call.return(err, { state: 'rejected' });
    });
}
function getPromiseStub(context) {
    var player = context.newStubRecorder();
    var instance = player.construct();
    var call = instance.newCall();
    return new Promise(function (resolve, reject) {
        call.waitUntilReturn(function () {
            if (call.succeed({ state: 'fulfilled' })) {
                resolve(call.result());
            }
            else {
                reject(call.thrown());
            }
        });
    });
}
//# sourceMappingURL=promisePlugin.js.map