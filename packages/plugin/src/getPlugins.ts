import { store } from './store';

export function getPlugins() {
  return store.get().plugins
}
