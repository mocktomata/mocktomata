import { findPlugin } from '@komondor-lab/plugin';
import { unpartial } from 'unpartial';
import { NotSpecable } from '../errors';
import { defaultSpecOptions } from '../SpecOptions';
import { InvocationContext } from './InvocationContext';
import { ready } from '../../runtime';
export async function createSaveSpec({ io }, id, subject, options) {
    const o = unpartial(defaultSpecOptions, options);
    const { logger } = await ready;
    const plugin = findPlugin(subject);
    if (!plugin) {
        throw new NotSpecable(subject);
    }
    const actions = [];
    const context = new InvocationContext({ actions, instanceIds: {} }, plugin.name);
    const timeoutHandle = setTimeout(() => {
        logger.warn(`no action for ${o.timeout} ms. Did you forget to call done()?`);
    }, o.timeout);
    timeoutHandle.refresh();
    return {
        subject: createSpy(context, plugin, subject),
        done() {
            console.log(actions);
            return new Promise(a => {
                a(io.writeSpec(id, { actions }));
            });
        }
    };
}
function createSpy(context, plugin, subject) {
    return plugin.getSpy(context, subject);
}
//# sourceMappingURL=createSaveSpec.js.map