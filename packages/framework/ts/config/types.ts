import { LogMethodNames } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { Spec } from '../spec/types.js'

export type Config = Spec.Config & SpecPlugin.Config & Log.Config
export namespace Config {
	export type Input = {
		overrideMode?: Spec.OverrideMode
		filePathFilter?: string
		specNameFilter?: string
		logLevel?: LogMethodNames | number
		/**
		 * Should logs be emitted.
		 * Default to true.
		 */
		emitLog?: boolean
	} & Partial<SpecPlugin.Config>

	export type IO = {
		loadConfig(): Promise<Input>
	}
	export type Options = {
		config?: Spec.Config & Partial<SpecPlugin.Config> & Log.Config
	}

	export type ResultContext = {
		config: Config
	}

	export type Context = {
		configurator: { store: Config.ResultContext; config(input: Input): void }
		// loadConfig: (ctx: { io: IO }) => ResultContext
		// config: Spec.Config & SpecPlugin.Config & Log.Config
	}
}
