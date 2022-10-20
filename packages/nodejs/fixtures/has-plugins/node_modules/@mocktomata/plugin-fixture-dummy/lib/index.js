"use strict";
// import { PluginActivationContext } from 'komondor-support-utils'
Object.defineProperty(exports, "__esModule", { value: true });
function activate(context) {
    context.register({
        name: '@komondor-lab/plugin-fixture-dummy',
        support: function () { return false; },
        getSpy: function () { return; },
        getStub: function () { return; },
        serialize: function () { return 'dummy'; }
    });
}
exports.activate = activate;
//# sourceMappingURL=index.js.map