import { SpecMode } from 'komondor-plugin';
import { KomondorOptions } from './interfaces';
import { store } from './store';

// import { registerPlugin } from './plugin'

export interface Config {
  (options: KomondorOptions): void,
  scenario(mode: SpecMode, ...filters: (string | RegExp)[]): void,
  spec(mode: SpecMode, ...filters: (string | RegExp)[]): void,
  /**
   * Manually register a plugin.
   * This should be used only for plugin development.
   */
  // registerPlugin(plugin: { activate(registrar: Registrar): void }): void
}

export const config: Config = Object.assign(
  function config(options: KomondorOptions) {
    store.get().options = options
  },
  {
    scenario(mode: SpecMode, ...filters: (string | RegExp)[]) {
      if (filters.length > 0) {
        store.get().scenarioOverrides.push(...filters.map(filter => ({ mode, filter })))
      }
      else {
        store.get().scenarioDefaultMode = mode
      }
    },
    spec(mode: SpecMode, ...filters: (string | RegExp)[]) {
      if (filters.length > 0) {
        store.get().specOverrides.push(...filters.map(filter => ({ mode, filter })))
      }
      else {
        store.get().specDefaultMode = mode
      }
    },
    // registerPlugin
  })
