import { createContext } from 'async-fp';
import { SpecIO, SpecPluginModuleIO } from './mockto/types';

export type MocktomataContext = {
  io: SpecIO & SpecPluginModuleIO,
}

export const context = createContext<MocktomataContext>()
