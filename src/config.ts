import { unpartial } from 'unpartial'

import { store } from './store'
import { KomondorOptions } from './interfaces'


export function config(givenOptions?: Partial<KomondorOptions>) {
  const options = unpartial<KomondorOptions>({} as any, givenOptions)
  store.mode = options.mode as any
  store.spec = options.spec
  store.store = options.store
}
