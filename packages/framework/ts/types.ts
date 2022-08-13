import { LogLevel } from 'standard-log'
import { ReplaceProperty } from 'type-plus'
import { SpecPlugin } from './spec-plugin/types.js'
import { Spec } from './spec/types.js'

export namespace Mocktomata {
  export type Context = { config: Config, io: IO }
  export type Config = Spec.Config & SpecPlugin.Config & {
    logLevel?: LogLevel
  }
  export type IO = ReplaceProperty<
    Spec.IO & SpecPlugin.IO,
    'getConfig',
    () => Promise<Spec.Config & SpecPlugin.Config & { logLevel?: string }>>
}
