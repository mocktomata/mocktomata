import { SpecMode, Registrar } from 'komondor-plugin'

import { store } from './store'
import { KomondorOptions, GivenMode } from './interfaces'
import { registerPlugin } from './plugin'

export interface Config {
  (options: KomondorOptions): void,
  scenario(mode: SpecMode, ...filters: (string | RegExp)[]): void,
  given(mode: GivenMode, ...filters: (string | RegExp)[]): void,
  spec(mode: SpecMode, ...filters: (string | RegExp)[]): void,
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
    scenario(mode: SpecMode, ...filters: (string | RegExp)[]) {
      if (filters.length > 0) {
        store.scenarioOverrides.push(...filters.map(filter => ({ mode, filter })))
      }
      else {
        // istanbul ignore next
        store.defaultMode = mode
      }
    },
    given(mode: GivenMode, ...filters: (string | RegExp)[]) {
      if (filters.length > 0) {
        store.envOverrides.push(...filters.map(filter => ({ mode, filter })))
      }
      else {
        store.envDefaultMode = mode
      }
    },
    spec(mode: SpecMode, ...filters: (string | RegExp)[]) {
      if (filters.length > 0) {
        store.specOverrides.push(...filters.map(filter => ({ mode, filter })))
      }
      else {
        store.specDefaultMode = mode
      }
    },
    registerPlugin
  })
