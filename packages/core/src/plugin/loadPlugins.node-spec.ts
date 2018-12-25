import t from 'assert';
import a from 'assertron';
import { loadPlugins } from '.';
import { store } from '../runtime';
import { PluginNotExist } from './errors';

afterEach(() => store.set('plugins', []))

it('not existing plugin throws PluginNotExist', () => {
  const err = a.throws(() => loadPlugins(['not-exist-plugin']), PluginNotExist)
  t.strictEqual(err.pluginName, 'not-exist-plugin')
})
