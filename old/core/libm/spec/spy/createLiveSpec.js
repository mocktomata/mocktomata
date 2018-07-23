import { findPlugin } from '@komondor-lab/plugin';
import { NotSpecable } from '../errors';
import { InvocationContext } from './InvocationContext';
export async function createLiveSpec(subject) {
    const plugin = findPlugin(subject);
    if (!plugin) {
        throw new NotSpecable(subject);
    }
    const actions = [];
    const context = new InvocationContext({ actions, instanceIds: {} }, plugin.name);
    return {
        subject: createSpy(context, plugin, subject),
        done() {
            return Promise.resolve();
        }
    };
}
function createSpy(context, plugin, subject) {
    return plugin.getSpy(context, subject);
}
//# sourceMappingURL=createLiveSpec.js.map