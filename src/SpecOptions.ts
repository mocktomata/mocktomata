import { store } from './store'
import { SpecOptions } from './interfaces'

export const defaultSpecOptions = { mode: 'verify' } as SpecOptions

export function getMode(options: SpecOptions) {
  if (store.mode) {
    if (store.spec) {
      if (options.id === store.spec)
        return store.mode
      if (store.spec instanceof RegExp && store.spec.test(options.id))
        return store.mode
      return options.mode
    }
    return store.mode
  }
  return options.mode
}
