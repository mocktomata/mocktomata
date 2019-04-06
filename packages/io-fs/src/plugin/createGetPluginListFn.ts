import { findByKeywords } from 'find-installed-packages';
import { KOMONODR_PLUGIN_KEYWORD } from '../constants';

export function createGetPluginListFn({ cwd, config }: { cwd: string, config: { plugins?: string[] } }): () => Promise<string[]> {
  return async () => {
    if (config.plugins) return config.plugins
    return findByKeywords([KOMONODR_PLUGIN_KEYWORD], { cwd })
  }
}
