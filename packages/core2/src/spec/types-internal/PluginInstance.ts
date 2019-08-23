import { RequiredPick } from 'type-plus';
import { SpecPlugin } from '../types';

export type SpecPluginInstance = RequiredPick<SpecPlugin, 'name'>
