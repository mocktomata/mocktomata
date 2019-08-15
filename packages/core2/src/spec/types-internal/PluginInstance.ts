import { RequiredPick } from 'type-plus';
import { SpecPlugin } from '../types';

export type PluginInstance = RequiredPick<SpecPlugin, 'name'>
