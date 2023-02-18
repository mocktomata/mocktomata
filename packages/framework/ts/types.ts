import { Config } from './config/types.js'
import type { Log } from './log/types.js'
import type { SpecPlugin } from './spec_plugin/types.js'
import type { Spec } from './spec/types.js'

/**
 * Namespace for key types of the package.
 * @note If `mockto`, `komondor`, `zucchini` needs different types,
 * they will be placed elsewhere.
 */
export namespace Mocktomata {
	export type IO = Spec.IO & SpecPlugin.IO & Config.IO
	// & {
	//   getConfig(): Promise<Record<string, any>>
	// }
	export type IOContext = { io: IO }
	export type Context = IOContext & Log.Context & Config.Context

	/**
	 * Activation Context for plugin.
	 */
	export type ActivationContext = SpecPlugin.ActivationContext
}
