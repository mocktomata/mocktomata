import { store } from './store'
import { KomondorOptions } from './interfaces'
import { unpartial } from 'unpartial';

export function config(givenOptions: Partial<KomondorOptions>) {
  const options = unpartial({ mode: 'verify' }, givenOptions)
  store.mode = options.mode
}
