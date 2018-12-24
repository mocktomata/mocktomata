import { Config } from './interfaces';
import { store } from './store';

export function config(options: Config) {
  store.set(options)
}
