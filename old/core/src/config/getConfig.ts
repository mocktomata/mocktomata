import { store } from './store';

export function getConfig() {
  return store.get()
}
