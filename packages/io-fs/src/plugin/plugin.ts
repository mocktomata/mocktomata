import { findByKeywords } from 'find-installed-packages';
import { KOMONODR_PLUGIN_KEYWORD } from '../constants';

export function createPluginRepository({ cwd, config }: { cwd: string, config: { plugins?: string[] } }) {
  return {
    async getPluginList(): Promise<string[]> {
      if (config.plugins) return config.plugins
      return findByKeywords([KOMONODR_PLUGIN_KEYWORD], { cwd })
    },
    async loadPlugin(name: string) {
      return require(name)
    }
  }
}
