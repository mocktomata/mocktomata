import { RemoteStoreOptions, SpecMode } from './interfaces'

export interface GivenHandlerEntry {
  clause: string | RegExp,
  handler: any,
  invoked?: true
}

let specDefaultMode
let specOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
let givenEntries: GivenHandlerEntry[] = []
let envDefaultMode
let envOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
let storage

export let store = {
  specDefaultMode,
  specOverrides,
  givenEntries,
  envDefaultMode,
  envOverrides,
  get store(): RemoteStoreOptions {
    return storage
  },
  set store(value: RemoteStoreOptions) {
    storage = value
  }
}

// for testing only
export function resetStore() {
  store.specDefaultMode = undefined
  store.specOverrides = []
  store.givenEntries = []
  store.envDefaultMode = undefined
  store.envOverrides = []
}
