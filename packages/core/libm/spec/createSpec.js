import { context } from '../context';
import { findPlugin } from '../plugin';
import { createTimeoutWarning } from './createTimeoutWarning';
import { IDCannotBeEmpty, NotSpecable, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { createSpecRecordTracker, createSpecRecordValidator } from './SpecRecord';
export function createSpec(defaultMode) {
    return async (id, subject, options = { timeout: 3000 }) => {
        const { io } = await context.get();
        assertSpecID(id);
        const mode = getEffectiveSpecMode(id, defaultMode);
        switch (mode) {
            case 'auto':
                return createAutoSpec({ io }, id, subject, options);
            case 'live':
                return createLiveSpec({ io }, id, subject, options);
            case 'save':
                return createSaveSpec({ io }, id, subject, options);
            case 'simulate':
                return createSimulateSpec({ io }, id, subject, options);
        }
    };
}
function assertSpecID(id) {
    if (id === '')
        throw new IDCannotBeEmpty();
}
export async function createAutoSpec(context, id, subject, options) {
    try {
        return await createSimulateSpec(context, id, subject, options);
    }
    catch (e) {
        if (e instanceof SpecNotFound) {
            return createSaveSpec(context, id, subject, options);
        }
        else {
            throw e;
        }
    }
}
export async function createLiveSpec(context, id, subject, options) {
    const recorder = createRecorder(context, id, options);
    return {
        subject: recorder.getSpy(subject),
        done() {
            return recorder.end();
        }
    };
}
export async function createSaveSpec(context, id, subject, options) {
    const recorder = createRecorder(context, id, options);
    return {
        subject: recorder.getSpy(subject),
        done() {
            return recorder.save();
        }
    };
}
export async function createSimulateSpec(context, id, subject, options) {
    const player = await createPlayer(context, id, subject, options);
    return {
        subject: player.stub,
        async done() {
            return player.end();
        }
    };
}
function createRecorder(context, id, options) {
    const record = { refs: [], actions: [] };
    const recordTracker = createSpecRecordTracker(record);
    const idleWarning = createTimeoutWarning(options.timeout);
    return {
        getSpy(subject) {
            if (typeof subject === 'string')
                throw new NotSpecable(subject);
            try {
                return getSpy(recordTracker, subject);
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
function getSpy(recordTracker, subject, source) {
    const plugin = findPlugin(subject);
    if (!plugin)
        throw new NotSpecable(subject);
    const spyContext = createSpyContext(recordTracker, plugin, subject);
    const spy = plugin.getSpy(spyContext, subject);
    return spy;
}
function createSpyContext(recordTracker, plugin, subject) {
    return {
        newSpyRecorder(spy, meta) {
            const ref = recordTracker.getReference(plugin.name, spy);
            return {
                construct(args) {
                    recordTracker.addAction({
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
                    const spiedArgs = args.map((arg, i) => getSpy(recordTracker, arg, { ref, site: [i] }));
                    recordTracker.invoke(ref, spiedArgs);
                    return {
                        spiedArgs,
                        return(result) {
                            const spiedResult = getSpy(recordTracker, result);
                            recordTracker.return(ref, spiedResult);
                            return spiedResult;
                        },
                        throw(error) {
                            const spiedError = getSpy(recordTracker, error);
                            recordTracker.throw(ref, spiedError);
                            return spiedError;
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
async function createPlayer(context, id, subject, options) {
    if (typeof subject === 'string')
        throw new NotSpecable(subject);
    const plugin = findPlugin(subject);
    if (!plugin)
        throw new NotSpecable(subject);
    const record = { refs: [], actions: [] };
    const actual = await context.io.readSpec(id);
    const recordValidator = createSpecRecordValidator(id, actual, record);
    const stubContext = createStubContext(recordValidator, plugin, subject);
    const stub = plugin.getStub(stubContext, subject);
    return {
        stub,
        async end() {
            return;
        }
    };
}
function createStubContext(recordValidator, plugin, subject) {
    return {
        newStubRecorder(stub, meta) {
            const ref = recordValidator.getReference(plugin.name, stub);
            return {
                invoke(args = []) {
                    const spiedArgs = args.map(arg => getSpy(recordValidator, arg));
                    recordValidator.invoke(ref, spiedArgs);
                    // TODO process until ready
                    return {
                        succeed() {
                            return recordValidator.succeed();
                        },
                        result() {
                            return recordValidator.result();
                        }
                    };
                }
            };
        }
    };
}
//# sourceMappingURL=createSpec.js.map