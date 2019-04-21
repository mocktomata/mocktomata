import { Logger } from '@unional/logging';
import { createContext } from 'async-fp';
import { PluginIO } from './plugin';
import { SpecIO } from './spec/types';

export const context = createContext<SpecContext>()

export type SpecContext = {
  log: Logger
  io: SpecIO & PluginIO
}
