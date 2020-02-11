import { LogLevel } from 'standard-log';
import { Spec, SpecPlugin, SpecRecord } from '../spec/types';

export type TestHarness = {
  addPluginModule(pluginName: string, pluginModule: SpecPlugin.Module): void,
  enableLog(level?: LogLevel): void,
  reset(): void,
  logSpecRecord(title: string): void,
  getSpecRecord(title: string): SpecRecord,
  start(): Promise<void>
}
export namespace TestHarness {
  export type Options = {
    target: 'es2015',
    logLevel?: number,
  }
}
export type SequenceHandler<S = Spec> = (specName: string, specs: { save: S, simulate: S }) => void

