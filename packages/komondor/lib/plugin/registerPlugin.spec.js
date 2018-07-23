"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assertron_1 = __importDefault(require("assertron"));
const errors_1 = require("./errors");
const registerPlugin_1 = require("./registerPlugin");
const getPlugins_1 = require("./getPlugins");
const satisfier_1 = require("satisfier");
test('register plugin', () => {
    registerPlugin_1.registerPlugin(createEmptyPlugin('dummy'));
    assertron_1.default.satisfies(getPlugins_1.getPlugins(), satisfier_1.some({ type: 'dummy' }));
});
test('registering plugin with the same name throws PluginAlreadyLoaded', () => {
    registerPlugin_1.registerPlugin(createEmptyPlugin('same-name'));
    assertron_1.default.throws(() => registerPlugin_1.registerPlugin(createEmptyPlugin('same-name')), errors_1.PluginAlreadyLoaded);
});
function createEmptyPlugin(type) {
    return {
        activate(a) {
            a.register(type, () => false, () => { return; }, () => { return; }, () => '');
        }
    };
}
//# sourceMappingURL=registerPlugin.spec.js.map