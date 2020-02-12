import { LogLevel } from 'standard-log'
import { SpecPlugin, SpecRecord } from '../spec'

export type TestHarness = {
  addPluginModule(pluginName: string, pluginModule: SpecPlugin.Module): void,
  enableLog(level?: LogLevel): void,
  reset(): void,
  logSpecRecord(title: string): void,
  getSpecRecord(title: string): SpecRecord,
  start(): Promise<TestHarness>
}
export namespace TestHarness {
  export type Options = {
    target: 'es2015',
    logLevel?: number,
  }
}

