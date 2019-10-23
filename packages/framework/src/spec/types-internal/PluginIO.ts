
import { SpecPluginModule } from '../types';

export type PluginIO = {
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<SpecPluginModule>,
}
