import { store } from '../store';

export function findPlugin(subject: any) {
  const plugins = store.value.plugins
  return plugins.find(p => p.support(subject))
}

export function getPlugin(pluginName: string) {
  const plugins = store.value.plugins
  return plugins.find(p => p.name === pluginName)
}
