import { SpecMode } from 'komondor-plugin'

import { store } from './store'
import { KomondorOptions } from './interfaces'

export const config = Object.assign(
  function config(options: KomondorOptions) {
    store.options = options
  },
  {
    environment(mode: 'live', filter?: string | RegExp) {
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
    }
  })
