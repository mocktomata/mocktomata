import { Config } from '@mocktomata/framework'
import { CannotConfigAfterUsed } from '../errors.js'
import { store } from './store.js'

export function config(input: Partial<Config.Input>) {
  if (store.value.config) throw new CannotConfigAfterUsed()
  store.value.config = input
}
