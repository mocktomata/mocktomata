import { createStore } from 'global-store'
import { createDefaultConfig } from './createDefaultConfig';
import { KomondorConfig } from './interfaces';

const store = createStore<KomondorConfig>('@komondor/config', createDefaultConfig())

export { store }
