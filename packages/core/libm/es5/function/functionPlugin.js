import { hasPropertyInPrototype } from '../hasPropertyInPrototype';
import { assignPropertiesIfNeeded, getPartialProperties } from './composeWithSubject';
export const functionPlugin = {
    name: 'function',
    support: subject => {
        if (typeof subject !== 'function')
            return false;
        if (hasPropertyInPrototype(subject))
            return false;
        return true;
    },
    getSpy: (context, subject) => {
        const meta = {
            functionName: subject.name,
            properties: getPartialProperties(subject)
        };
        const spy = assignPropertiesIfNeeded(function (...args) {
            const call = recorder.invoke(args);
            try {
                const result = subject.apply(this, call.spiedArgs);
                return call.return(result);
            }
            catch (err) {
                throw call.throw(err);
            }
        }, meta.properties);
        const recorder = context.newSpyRecorder(spy, meta);
        return spy;
    },
    getStub: (context, subject) => {
        const meta = {
            functionName: subject.name,
            properties: getPartialProperties(subject)
        };
        const stub = assignPropertiesIfNeeded(function (...args) {
            const call = recorder.invoke(args);
            if (call.succeed()) {
                return call.result();
            }
            else {
                throw call.result();
            }
        }, meta.properties);
        const recorder = context.newStubRecorder(stub, meta);
        return stub;
    }
};
//# sourceMappingURL=functionPlugin.js.map