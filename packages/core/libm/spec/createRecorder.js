import { findPlugin } from '../plugin';
import { createTimeoutWarning } from './createTimeoutWarning';
import { NotSpecable } from './errors';
import { getRef } from './getRef';
export function createRecorder(context, id, options) {
    const record = { refs: [], actions: [] };
    const idleWarning = createTimeoutWarning(options.timeout);
    return {
        getSpy(subject) {
            try {
                return getSpy(record, subject);
            }
            catch (e) {
                idleWarning.stop();
                throw e;
            }
        },
        async end() {
            idleWarning.stop();
        },
        async save() {
            await this.end();
            return context.io.writeSpec(id, makeSerializable(record));
        }
    };
}
function getSpy(record, subject, source) {
    const plugin = findPlugin(subject);
    if (!plugin)
        throw new NotSpecable(subject);
    const spyContext = createSpyContext(record, plugin, subject);
    const spy = plugin.getSpy(spyContext, subject);
    return spy;
}
function createSpyContext(record, plugin, subject) {
    return {
        newSpyRecorder(spy, meta) {
            const ref = getRef(record, spy);
            return {
                construct(args) {
                    record.actions.push({
                        type: 'construct',
                        payload: args,
                        ref
                    });
                    return {};
                },
                /**
                 * @param target The scope. This is usually the stub.
                 */
                invoke(args = []) {
                    record.actions.push({
                        type: 'invoke',
                        payload: args,
                        ref
                    });
                    const spiedArgs = args.map((arg, i) => getSpy(record, arg, { ref, site: [i] }));
                    return {
                        spiedArgs,
                        return(result) {
                            record.actions.push({
                                type: 'return',
                                payload: result,
                                ref
                            });
                            return getSpy(record, result);
                        },
                        throw(error) {
                            record.actions.push({
                                type: 'throw',
                                payload: error,
                                ref
                            });
                            return getSpy(record, error);
                        }
                    };
                },
                get(target, prop) {
                    return {};
                },
                set(target, prop, value) {
                    return {};
                }
            };
        }
    };
}
function makeSerializable(record) {
    return record;
}
//# sourceMappingURL=createRecorder.js.map