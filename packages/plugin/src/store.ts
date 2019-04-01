import { createStore } from 'global-store';
import { PluginInstance } from './interfaces';

export const store = createStore<{ plugins: PluginInstance[] }>('@komondor-lab/plugin', { plugins: [] })
