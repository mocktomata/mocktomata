import { SpecMode } from './interfaces'
import { RemoteStoreOptions } from './index';

let mode
let spec
let storage

export let store = {
  get mode(): SpecMode | undefined {
    return mode
  },
  set mode(value: SpecMode | undefined) {
    if (mode !== value) {
      mode = value
    }
  },
  get spec(): string | RegExp {
    return spec
  },
  set spec(value: string | RegExp) {
    spec = value
  },
  get store(): RemoteStoreOptions {
    return storage
  },
  set store(value: RemoteStoreOptions) {
    storage = value
  }
}
