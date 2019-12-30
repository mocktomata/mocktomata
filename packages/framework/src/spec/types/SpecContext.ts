import { SpecIO } from './SpecIO';
import { SpecPluginModuleIO } from './SpecPluginModule';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO,
}
