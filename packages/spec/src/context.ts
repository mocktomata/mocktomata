import { createContext } from 'async-fp';
import { SpecIO } from './spec/types';
import { PluginIO } from './types';

export const context = createContext<SpecContext>()

export type SpecContext = {
  io: SpecIO & PluginIO
}
