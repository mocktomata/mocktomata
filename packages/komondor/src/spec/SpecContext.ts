import { Plugin } from '../plugin';
import { SpecAction } from './interfaces';
import { Logger } from '@unional/logging';

export type SpecRecord = { actions: SpecAction[] }

export type SpecIO = {
  readSpec(id: string): Promise<SpecRecord>
  writeSpec(id: string, record: SpecRecord): Promise<void>
}

export type SpecContext = {
  io: SpecIO,
  plugin: Plugin
}

export type SavingSpecContext = SpecContext & { logger: Logger }
