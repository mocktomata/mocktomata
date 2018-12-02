import '@komondor/plugin-fixture-deep-link/pluginA'
import '@komondor/plugin-fixture-dummy'
import '@komondor/plugin-fixture-no-activate'
import t from 'assert';
import a from 'assertron';
import { some } from 'satisfier';
import { loadPlugins } from '.';
import { store } from '../runtime';
import { PluginAlreadyLoaded, PluginNotConforming } from './errors';
import { getPlugins } from './getPlugins';

afterEach(() => store.set('plugins', []))

it('plugin without activate() thows PluginNotConforming', () => {
  const err = a.throws(() => loadPlugins(['@komondor/plugin-fixture-no-activate']), PluginNotConforming)
  t.strictEqual(err.pluginName, '@komondor/plugin-fixture-no-activate')
})

it('load plugin with same name throws PluginAlreadyLoaded', () => {
  const err = a.throws(() => loadPlugins(['@komondor/plugin-fixture-dummy', '@komondor/plugin-fixture-dummy']), PluginAlreadyLoaded)
  a.equal(err.pluginName, '@komondor/plugin-fixture-dummy')
})

it('can load node module plugin', () => {
  loadPlugins(['@komondor/plugin-fixture-dummy'])
  a.satisfy(getPlugins(), some({ name: '@komondor/plugin-fixture-dummy' }))
})

it('can load plugin using deep link', () => {
  loadPlugins(['@komondor/plugin-fixture-deep-link/pluginA'])
  a.satisfy(getPlugins(), some({ name: '@komondor/plugin-fixture-deep-link-pluginA' }))
})
