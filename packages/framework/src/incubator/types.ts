import { LogLevel, MemoryLogReporter } from 'standard-log';
import { SpecIO, SpecPlugin, SpecPluginModule, SpecPluginModuleIO, SpecRecord } from '../spec/types';

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: SpecPluginModule): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & SpecIO & SpecPluginModuleIO

export type TestHarness = {
  reporter: MemoryLogReporter,
  addPluginModule(pluginName: string, pluginModule: SpecPluginModule): void,
  enableLog(level?: LogLevel): void,
  reset(): void,
  logSpecRecord(title: string): void,
  getSpecRecord(title: string): SpecRecord,
  start(): Promise<void>
}
