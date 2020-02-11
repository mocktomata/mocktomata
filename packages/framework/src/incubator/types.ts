import { LogLevel } from 'standard-log';
import { Spec, SpecPlugin, SpecRecord } from '../spec/types';

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: SpecPlugin.Module): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & Spec.IO & SpecPlugin.IO

export type TestHarness = {
  addPluginModule(pluginName: string, pluginModule: SpecPlugin.Module): void,
  enableLog(level?: LogLevel): void,
  reset(): void,
  logSpecRecord(title: string): void,
  getSpecRecord(title: string): SpecRecord,
  start(): Promise<void>
}

export type SequenceHandler<S = Spec> = (specName: string, specs: { save: S, simulate: S }) => void

export type CreateTestHarnessOptions = {
  target: 'es2015',
  logLevel?: number,
}
