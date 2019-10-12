import { RequiredPick } from 'type-plus';
import { PluginIO } from './types';
import { SpecPlugin } from '../spec';

export type PluginInstance = RequiredPick<SpecPlugin, 'name'>

export type LoadPluginContext = {
  io: PluginIO
}
