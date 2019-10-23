import { createContext } from 'async-fp';
import { SpecIO, SpecPluginModuleIO } from './mockto/types';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO,
}

export const context = createContext<SpecContext>()
