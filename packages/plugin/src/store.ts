import { createStore } from 'global-store'
import { KomondorPlugin } from './interfaces'

export type PluginInstance = KomondorPlugin & { name: string }

export const store = createStore<{ plugins: PluginInstance[] }>('@komondor-lab/plugin', { plugins: [] })
