import { store } from './store'
import { SpecMode, GivenMode } from './interfaces'

export const config = {
  environment(mode: GivenMode, filter?: string | RegExp) {
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
}
