import a from 'assertron';
import { some } from 'satisfier';
import { PluginAlreadyLoaded, PluginNotConforming, registerPlugin } from '.';
import { getPlugins } from './getPlugins';
import { dummyPluginModule } from './test-util/dummyPlugin';
import { missGetSpyPluginModule } from './test-util/missGetSpyPlugin';
import { missGetStubPluginModule } from './test-util/missGetStubPlugin';
import { missSupportPluginModule } from './test-util/missSupportPlugin';
import { noActivatePluginModule } from './test-util/noActivatePluginModule';
test('register plugin', () => {
    registerPlugin('dummy', dummyPluginModule);
    a.satisfies(getPlugins(), some({ name: 'dummy' }));
});
test('registering plugin with the same name throws PluginAlreadyLoaded', () => {
    registerPlugin('same-name', dummyPluginModule);
    a.throws(() => registerPlugin('same-name', dummyPluginModule), PluginAlreadyLoaded);
});
test('plugin without activate function throws not conforming', () => {
    a.throws(() => registerPlugin('no-activate', noActivatePluginModule), PluginNotConforming);
});
test('plugin missing support method throuws not confirming', () => {
    a.throws(() => registerPlugin('miss-support', missSupportPluginModule), PluginNotConforming);
});
test('plugin missing getSpy method throuws not confirming', () => {
    a.throws(() => registerPlugin('miss-getSpy', missGetSpyPluginModule), PluginNotConforming);
});
test('plugin missing getStub method throuws not confirming', () => {
    a.throws(() => registerPlugin('miss-getStub', missGetStubPluginModule), PluginNotConforming);
});
//# sourceMappingURL=registerPlugin.spec.js.map