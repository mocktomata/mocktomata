// import { PluginActivationContext } from 'komondor-support-utils'
export function activate(context) {
    context.register({
        name: '@komondor-lab/plugin-fixture-dummy',
        support() { return false; },
        getSpy() { return; },
        getStub() { return; },
        serialize() { return 'dummy'; }
    });
}
//# sourceMappingURL=index.js.map