import { store } from './store'
import { BoundSpecOptions } from './interfaces'
import { unpartial } from 'unpartial';

export function config(givenOptions: Partial<BoundSpecOptions>) {
  const options = unpartial({ replay: false }, givenOptions)
  store.replay = options.replay
}
