import { store } from '../store';
import { PluginNotFound } from './errors';
import { SpecPlugin } from './types';

export function findPlugin<S>(subject: S): SpecPlugin.Instance<S> | undefined {
  const plugins = store.value.plugins
  return plugins.find(p => p.support(subject))
}

export function getPlugin(plugin: string) {
  const p = store.value.plugins.find(p => p.name === plugin)
  if (!p) throw new PluginNotFound(plugin)
  return p
}
