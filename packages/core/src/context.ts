import { createContext } from 'async-fp';
import { SpecIO } from './spec';
import { PluginIO } from './plugin';

export const context = createContext<SpecContext>()

export type SpecContext = {
  io: SpecIO & PluginIO
}
