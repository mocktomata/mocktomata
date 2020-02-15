import { LogLevel } from 'standard-log'
import { SpecRecord } from '../spec/types'
import { SpecPlugin } from '../spec-plugin/types'

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

