import { store } from './store';
import { KomondorOptions } from './interfaces';

// import {
//   config,
//   // @ts-ignore
//   Config
// } from './config'

// import {
//   spec,
//   // @ts-ignore
//   SpecFn
// } from './spec'

export const configurator = {
  config(options: KomondorOptions) {
    store.options = options
  }
}
