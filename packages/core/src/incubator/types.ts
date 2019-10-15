import { SpecIO, SpecPlugin, SpecPluginModule, SpecPluginModuleIO, SpecRecord } from '../spec/types';
import { MemoryLogReporter } from 'standard-log';

export type TestIO = {
  getAllSpecs(): IterableIterator<[string, string]>,
  addPluginModule(moduleName: string, pluginModule: SpecPluginModule): void,
  addPlugin(moduleName: string, ...plugins: SpecPlugin[]): void
} & SpecIO & SpecPluginModuleIO

export type TestHarness = {
  io: TestIO,
  reporter: MemoryLogReporter,
  showLog(level?: number): void,
  reset(): void,
  getSpec(id: string): Promise<SpecRecord>,
  logSpec(title: string): void,
  logSpecs(): void,
}
