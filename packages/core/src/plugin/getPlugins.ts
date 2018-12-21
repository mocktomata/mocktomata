import { store } from '../runtime';
import { Plugin } from './interfaces';

export function getPlugins() {
  return store.get<Plugin[]>('plugins', [])
}
