import { Mocktomata } from '@mocktomata/framework'
import { CannotConfigAfterUsed } from '../errors'
import { store } from './store'
import { required } from 'type-plus'

export function config(options: Partial<Mocktomata.Config>) {
  if (store.value.context) throw new CannotConfigAfterUsed()
  store.value.config = required({ plugins: [] }, options)
}
