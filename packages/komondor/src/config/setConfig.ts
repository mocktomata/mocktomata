import { Config } from './interfaces';
import { store } from './store';

export function setConfig(options: Config) {
  store.set(options)
}
