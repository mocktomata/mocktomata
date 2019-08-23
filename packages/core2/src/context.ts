import { createContext } from 'async-fp';
import { SpecPluginModuleIO, SpecIO } from './spec';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO
}

export const context = createContext<SpecContext>()

