import { NotSpecable } from '../../errors';
import { findPlugin } from '../../plugin';
import { createTimeoutWarning } from './createTimeoutWarning';
import { Recorder } from './Recorder';
export async function createLiveSpec({ log }, id, subject, options) {
    const plugin = findPlugin(subject);
    if (!plugin) {
        throw new NotSpecable(subject);
    }
    const recorder = new Recorder(plugin.name);
    const idleWarning = createTimeoutWarning(log, options.timeout);
    return {
        subject: plugin.getSpy(recorder, subject),
        done() {
            idleWarning.stop();
            return Promise.resolve();
        }
    };
}
//# sourceMappingURL=createLiveSpec.js.map