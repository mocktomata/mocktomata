import { SpecMode, Registrar } from 'komondor-plugin'

import { store } from './store'
import { KomondorOptions } from './interfaces'
import { registerPlugin } from './plugin'

export interface Config {
  (options: KomondorOptions): void,
  given(mode: 'live', filter?: string | RegExp): void,
  spec(mode: SpecMode, filter?: string | RegExp): void,
  /**
   * Manually register a plugin.
   * This should be used only for plugin development.
   */
  registerPlugin(plugin: { activate(registrar: Registrar): void }): void
}

export const config: Config = Object.assign(
  function config(options: KomondorOptions) {
    store.options = options
  },
  {
    given(mode: 'live', filter?: string | RegExp) {
      if (filter) {
        store.envOverrides.push({ mode, filter })
      }
      else {
        store.envDefaultMode = mode
      }
    },
    spec(mode: SpecMode, filter?: string | RegExp) {
      if (filter) {
        store.specOverrides.push({ mode, filter })
      }
      else {
        store.specDefaultMode = mode
      }
    },
    registerPlugin
  })
