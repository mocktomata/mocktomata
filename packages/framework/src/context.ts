import { createContext } from 'async-fp';
import { SpecPluginModuleIO, SpecIO } from './mockto';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO
}

export const context = createContext<SpecContext>()

