import { CannotConfigAfterUsed } from '../errors'
import { store } from './store'
import { config } from './types'

// // TODO: Detect different platforms and load different plugins.
// // e.g. NodeJS 5 does not support Promise, NodeJS 11 supports bigint
// // language and platform support will change over time.
// start({ io, libs: [] })

export function config(options: config.Options) {
  if (store.value.context) throw new CannotConfigAfterUsed()
  store.value.config = options
}
