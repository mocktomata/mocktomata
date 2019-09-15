import { RequiredPick } from 'type-plus';
import { store } from '../store';
import { SpecPlugin } from './types';
import { PluginNotFound } from './errors';

export function findPlugin<S>(subject: S): RequiredPick<SpecPlugin<S, any>, 'name'> | undefined {
  const plugins = store.value.plugins
  return plugins.find(p => p.support(subject))
}

export function getPlugin(plugin: string) {
  const p = store.value.plugins.find(p => p.name === plugin)
  if (!p) throw new PluginNotFound(plugin)
  return p
}
