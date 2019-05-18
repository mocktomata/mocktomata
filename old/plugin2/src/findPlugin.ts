import { getPlugins } from './getPlugins';

export function findPlugin(subject: any) {
  const plugins = getPlugins()
  return plugins.find(p => p.support(subject))
}
