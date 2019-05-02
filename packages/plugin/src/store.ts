import { createStore } from 'global-store';
import { PluginInstance } from './types';

export const store = createStore<{ plugins: PluginInstance[] }>('@komondor-lab/plugin', { plugins: [] })
