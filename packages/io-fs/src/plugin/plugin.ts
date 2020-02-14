import { SpecPlugin } from '@mocktomata/framework'
import { findByKeywords } from 'find-installed-packages'
import { MOCKTOMATA_PLUGIN_KEYWORD } from '../constants'

export function createPluginRepository({ cwd }: createPluginRepository.Options) {
  return {
    /**
     * Find installed plugins.
     * Note that this finds the plugin packages by package.json keywords.
     * If the package's main is not the plugin module,
     * you need to adjust the id accordingly.
     * i.e. this is mostly used to show user what's installed.
     */
    findInstalledPlugins() {
      return findByKeywords([MOCKTOMATA_PLUGIN_KEYWORD], { cwd })
    },
    /**
     * @returns plugin module.
     * Note that if the input id does not resolve to a valid pluing,
     * the return object will not follow the `SpecPlugin.Module` type.
     */
    loadPlugin(id: string): SpecPlugin.Module {
      return require(id)
    }
  }
}

export namespace createPluginRepository {
  export type Options = {
    cwd: string,
  }
}
