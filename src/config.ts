import { store } from './store'
import { ExecutionModes } from './interfaces'

export const config = {
  spec(mode: ExecutionModes, filter?: string | RegExp) {
    if (filter) {
      store.specOverrides.push({ mode, filter })
    }
    else {
      store.specDefaultMode = mode
    }
  }
}
