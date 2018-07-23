import { getPropertyNames } from './getPropertyNames';
export function stubClass(context, subject) {
    const player = context.newStubRecorder({ className: subject.name });
    const stubClass = class extends subject {
        constructor(...args) {
            // @ts-ignore
            super(...args);
            // tslint:disable-next-line:variable-name
            this.__komondorStub = {};
            this.__komondorStub.instance = player.construct(args);
        }
    };
    getPropertyNames(stubClass).forEach(p => {
        stubClass.prototype[p] = function (...args) {
            const instance = this.__komondorStub.instance;
            const call = instance.newCall({ methodName: p });
            call.invoked(args);
            call.blockUntilReturn();
            if (call.succeed()) {
                return call.result();
            }
            throw call.thrown();
        };
    });
    return stubClass;
}
//# sourceMappingURL=stubClass.js.map