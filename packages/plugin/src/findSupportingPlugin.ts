import { getPlugins } from './getPlugins';

export function findSupportingPlugin(subject: any) {
  const plugins = getPlugins()
  return plugins.find(p => p.support(subject))
}
