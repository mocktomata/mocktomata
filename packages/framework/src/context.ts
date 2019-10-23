import { createContext } from 'async-fp';
import { SpecIO, SpecPluginModuleIO } from './spec/types';

export type SpecContext = {
  io: SpecIO & SpecPluginModuleIO,
}

export const context = createContext<SpecContext>()
