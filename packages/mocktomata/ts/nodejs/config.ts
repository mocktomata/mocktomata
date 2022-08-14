import { Mocktomata } from '@mocktomata/framework'
import { required } from 'type-plus'
import { CannotConfigAfterUsed } from '../errors.js'
import { store } from './store.js'

export function config(options: Partial<Mocktomata.Config>) {
  if (store.value.config) throw new CannotConfigAfterUsed()
  store.value.config = required({ plugins: [] }, options)
}
