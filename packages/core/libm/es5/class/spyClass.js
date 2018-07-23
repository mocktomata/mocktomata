import { isPromise } from '../promise/isPromise';
import { getPropertyNames } from './getPropertyNames';
export function spyClass(context, subject) {
    const recorder = context.newSpyRecorder({ className: subject.name });
    const spiedClass = class extends subject {
        constructor(...args) {
            // @ts-ignore
            super(...args);
            // tslint:disable-next-line:variable-name
            this.__komondor = {};
            this.__komondor.instance = recorder.construct(args);
        }
    };
    const propertyNames = getPropertyNames(spiedClass);
    propertyNames.forEach(p => {
        const method = spiedClass.prototype[p];
        spiedClass.prototype[p] = function (...args) {
            const invoking = this.__komondor.invoking;
            const instance = this.__komondor.instance;
            if (!invoking) {
                this.__komondor.invoking = true;
                const call = instance.newCall({ methodName: p });
                const spiedArgs = call.invoke(args);
                let result;
                try {
                    result = method.apply(this, spiedArgs);
                }
                catch (err) {
                    const thrown = call.throw(err);
                    this.__komondor.invoking = false;
                    throw thrown;
                }
                const returnValue = call.return(result);
                // TODO: rethink SpyCall implmentation to avoid mixing promise and class logic together
                // This is not ideal as it mixes concerns.
                if (isPromise(returnValue)) {
                    returnValue.then(() => this.__komondor.invoking = false);
                }
                else
                    this.__komondor.invoking = false;
                return returnValue;
            }
            else {
                return method.apply(this, args);
            }
        };
    });
    return spiedClass;
}
//# sourceMappingURL=spyClass.js.map