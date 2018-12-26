// TODO: remove workaround for karma-typescript
import 'komondor-plugin-fixture-deep-link/pluginA';
import 'komondor-plugin-fixture-dummy';
import 'komondor-plugin-fixture-no-activate';
import { PluginNotConforming, PluginNotFound } from './errors';

export function loadPlugin(pluginName: string) {
  const m = tryImport(pluginName)
  if (typeof m.activate !== 'function') {
    throw new PluginNotConforming(pluginName)
  }
  return m
}

function tryImport(pluginName: string) {
  try {
    // TODO: add README about bundling komondor with plugins
    // Doing this rename because karma-typescript tries to load 'pluginPath' module when there is `require(pluginPath)`
    // That's a bug of karma-typescript.
    // return require('komondor-plugin-fixture-no-activate')
    return require(pluginName)
  }
  catch {
    throw new PluginNotFound(pluginName)
  }
}
