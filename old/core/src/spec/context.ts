import { createContext } from 'async-fp'
import { Logger } from '@unional/logging';
import { SpecIO } from './interfaces';

export type SpecContext = {
  log: Logger
  io: SpecIO
}

export const context = createContext<SpecContext>()
