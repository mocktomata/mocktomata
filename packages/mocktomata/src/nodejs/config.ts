import { SpecContext } from '@mocktomata/framework';
import { createIO, CreateIOOptions } from '@mocktomata/io-local';
import { createContext } from 'async-fp';
import { CannotConfigAfterUsed } from '../errors';
import { store } from '../store';

// // TODO: Detect different platforms and load different plugins.
// // e.g. NodeJS 5 does not support Promise, NodeJS 11 supports bigint
// // language and platform support will change over time.
// start({ io, libs: [] })


export function config(options: config.Options) {
  if (store.value.context) throw new CannotConfigAfterUsed()
  const io = createIO(options.io)
  // const target = options.runtime?.target || detectTarget()
  const context = createContext<SpecContext>()
  context.set({ io })
  store.value.context = context
}


export namespace config {
  export type Options = {
    io?: CreateIOOptions,
    runtime?: {
      target?: 'es2015'

    }
  }
}
