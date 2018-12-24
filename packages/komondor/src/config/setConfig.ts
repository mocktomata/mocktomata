import { store } from './store';

export function setConfig(options: object) {
  store.set(options)
}

