import { store } from '../runtime';
import { createDefaultConfig } from './createDefaultConfig';
import { KomondorConfig } from './interfaces';

export function getConfig() {
  return store.get<KomondorConfig>('config', createDefaultConfig())
}
