import { CannotConfigAfterUsed } from '@mocktomata/framework'
import { store } from './store.js'

export namespace config {
  export type Options = {
    clientOptions?: {
      url: string
    }
  }
}

export function config(options: config.Options) {
  if (store.value.config) throw new CannotConfigAfterUsed()
  store.value.config = options
}
