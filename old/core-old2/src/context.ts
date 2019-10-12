import { createContext } from 'async-fp';
import { SpecIO } from './spec';
import { PluginIO } from './plugin';

export type SpecContext = {
  io: SpecIO & PluginIO
}

export const context = createContext<SpecContext>()

