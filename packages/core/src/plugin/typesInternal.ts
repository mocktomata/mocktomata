import { RequiredPick } from 'type-plus';
import { KomondorPlugin, PluginIO } from './types';

export type PluginInstance = RequiredPick<KomondorPlugin, 'name'>

export type LoadPluginContext = {
  io: PluginIO
}
