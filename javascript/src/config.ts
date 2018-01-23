import { store } from './store'
import { KomondorOptions } from './interfaces'
import { unpartial } from 'unpartial';

export function config(givenOptions?: Partial<KomondorOptions>) {
  const options = unpartial<KomondorOptions>({} as any, givenOptions)
  store.mode = options.mode as any
  store.spec = options.spec
}
