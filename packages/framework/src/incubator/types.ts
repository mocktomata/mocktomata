import { LogLevel } from 'standard-log';
import { Spec, SpecIO, SpecPlugin, SpecPluginModule, SpecPluginModuleIO, SpecRecord } from '../spec/types';

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: SpecPluginModule): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & SpecIO & SpecPluginModuleIO

export type TestHarness = {
  addPluginModule(pluginName: string, pluginModule: SpecPluginModule): void,
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
