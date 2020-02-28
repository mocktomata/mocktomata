import { config } from './types'
import { store } from './store'
import { CannotConfigAfterUsed } from '../errors'

export function config(options: config.Options) {
  if (store.value.config) throw new CannotConfigAfterUsed()
  store.value.config = options
}
