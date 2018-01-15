import { SpecMode } from './interfaces'

let mode
let spec
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
  }
}
