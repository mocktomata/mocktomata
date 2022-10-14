import type { Config } from './config/types.js'
import type { Log } from './log/types.js'
import type { SpecPlugin } from './spec-plugin/types.js'
import type { Spec } from './spec/types.js'

export namespace Mocktomata {
  export type IO = Spec.IO & SpecPlugin.IO & Config.IO

  /**
   * Configuration used within Mocktomata.
   * This is not used directly by the user.
   * The context should read config from various sources,
   * combine them and return a cleaned up Config for each system to use.
   * Therefore, a simple union is preferred,
   * instead of using `EitherOrBoth` which is for user input values.
   */
  export type Config = Spec.Config & SpecPlugin.Config & Log.Config

  export type Context = { config: Config, io: IO } & Log.Context
}
