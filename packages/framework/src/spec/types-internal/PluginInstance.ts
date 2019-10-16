import { RequiredPick } from 'type-plus';
import { SpecPlugin } from '../types';

export type SpecPluginInstance<S = any> = RequiredPick<SpecPlugin<S, any>, 'name'>
