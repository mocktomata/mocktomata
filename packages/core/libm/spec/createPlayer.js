import { findPlugin } from '../plugin';
import { NotSpecable } from './errors';
import { getRef } from './getRef';
export function createPlayer(context, id, options) {
    const record = { refs: [], actions: [] };
    return {
        getStub(subject) {
            return getStub(record, subject);
        },
        async end() {
            return;
        }
    };
}
function getStub(record, subject) {
    const plugin = findPlugin(subject);
    if (!plugin)
        throw new NotSpecable(subject);
    const stubContext = createStubContext(record, plugin, subject);
    return plugin.getStub(stubContext, subject);
}
function createStubContext(record, plugin, subject) {
    return {
        newStubRecorder(stub, meta) {
            const ref = getRef(record, stub);
            return {
                invoke(args = []) {
                    record.actions.push({
                        type: 'invoke',
                        payload: args,
                        ref
                    });
                    const stubbedArgs = args.map(arg => getStub(record, arg));
                    return {
                        stubbedArgs,
                    };
                }
            };
        }
    };
}
//# sourceMappingURL=createPlayer.js.map