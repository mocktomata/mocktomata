import { RemoteStoreOptions, ExecutionModes } from './interfaces'

export interface EnvironmentHandlerEntry {
  clause: string | RegExp,
  handler: any,
  invoked?: true
}

let specDefaultMode
let storage
let specOverrides: { mode: ExecutionModes, filter: string | RegExp }[] = []
let envEntries: EnvironmentHandlerEntry[] = []

export let store = {
  specDefaultMode,
  specOverrides,
  get store(): RemoteStoreOptions {
    return storage
  },
  set store(value: RemoteStoreOptions) {
    storage = value
  },
  envEntries
}
