import { isPromise } from './isPromise';
export const promisePlugin = {
    name: 'promise',
    support: isPromise,
    getSpy: getPromiseSpy,
    getStub: getPromiseStub
};
function getPromiseSpy(context, subject) {
    const recorder = context.newSpyRecorder();
    const instance = recorder.construct();
    const call = instance.newCall();
    return subject.then(result => {
        return call.return(result, { state: 'fulfilled' });
    }, err => {
        throw call.return(err, { state: 'rejected' });
    });
}
function getPromiseStub(context) {
    const player = context.newStubRecorder();
    const instance = player.construct();
    const call = instance.newCall();
    return new Promise((resolve, reject) => {
        call.waitUntilReturn(() => {
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