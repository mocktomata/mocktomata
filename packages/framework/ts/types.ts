import type { Log } from './log/types.js'
import type { SpecPlugin } from './spec-plugin/types.js'
import type { Spec } from './spec/types.js'

/**
 * Namespace for key types of the package.
 * @note If `mockto`, `komondor`, `zucchini` needs different types,
 * they will be placed elsewhere.
 */
export namespace Mocktomata {
  export type IO = Spec.IO & SpecPlugin.IO & {
    getConfig(): Promise<Record<string, any>>
  }
  export type IOContext = { io: IO }
  /**
   * Configuration used within Mocktomata.
   * This is not used directly by the user.
   * The context should read config from various sources,
   * combine them and return a cleaned up Config for each system to use.
   * Therefore, a simple union is preferred,
   * instead of using `EitherOrBoth` which is for user input values.
   */
  export type Config = Spec.Config & SpecPlugin.Config & Log.Config
  export type ConfigContext = { config: Config }

  export type Context = IOContext & ConfigContext & Log.Context
}
