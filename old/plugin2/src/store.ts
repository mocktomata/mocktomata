import { createStore } from 'global-store';
import { PluginInstance } from './types';

export const store = createStore<{ plugins: PluginInstance[] }>('@mocktomata/plugin', { plugins: [] })
