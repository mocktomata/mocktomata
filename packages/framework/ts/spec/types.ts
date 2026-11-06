import type { MemoryLogReporter } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec_plugin/types.js'
import type { SpecRecord } from '../spec_record/types.js'
import type { TimeTracker } from '../time_trackter/index.js'

export type Spec = {
	/**
	 * Creates a spec'd subject to capture or replay the behavior
	 */
	// biome-ignore lint/style/useShorthandFunctionType: the object form is what keeps the doc comment attached to the call signature, and the shorthand cannot intersect with `Spec.Base`.
	<S>(subject: S, options?: { mock?: Partial<S> }): Promise<S>
} & Spec.Base

export namespace Spec {
	export type Base = {
		/**
		 * The current mode of the spec.
		 */
		readonly mode: Spec.Mode
		/**
		 * Indicates the spec completes.
		 * @return the resulting `SpecRecord` for debugging purposes.
		 */
		done(): Promise<SpecRecord>
		/**
		 * Accept a value that changes between runs.
		 *
		 * Call it before creating the spec subject.
		 * When the spec is saved, the value is recorded as inert:
		 * during simulation, the value in its place is not compared,
		 * and the recorded value is used.
		 *
		 * Works on numbers, booleans, bigints, and strings.
		 * Strings are compared only when `argumentMatching` is `'strings'`,
		 * or when they are assigned to a property.
		 *
		 * @param value the value to accept.
		 */
		ignoreMismatch(value: unknown): void
		/**
		 * Mask some sensitive value from logs and record.
		 *
		 * The value is check against each log message,
		 * and each metadata in the record.
		 *
		 * @param value value to mask for.
		 * When the value is string, it will be used to replace each occurance within the logs and records.
		 *
		 * When the value is regex, it will be check against each log and each metadata in the record.
		 * Most of the time, regex with start and end anchor (`^` and `$`) will not work as expected.
		 *
		 * @param replaceWith value to replace with (Default: `[masked]`)
		 */
		maskValue(value: string | RegExp, replaceWith?: string): void
	}

	export type Config = {
		overrideMode?: OverrideMode
		filePathFilter?: RegExp
		specNameFilter?: RegExp
		/**
		 * Which arguments of function calls and `new` are compared with the record during simulation.
		 * The `argumentMatching` option of a spec overrides it.
		 *
		 * Default to `'behavior'`.
		 */
		argumentMatching?: ArgumentMatching
	}

	/**
	 * Which arguments of function calls and `new` are compared with the record during simulation.
	 *
	 * - `'behavior'`: numbers, booleans, and bigints are compared.
	 * Strings are not, so values such as paths, timestamps, and ids can change between runs.
	 * - `'strings'`: strings at the top level of the arguments are also compared.
	 * Strings inside objects and arrays are not.
	 *
	 * The comparison masks the value with the `maskValue()` criteria of the current run first.
	 * Values passed to `ignoreMismatch()` are not compared.
	 *
	 * This setting does not apply to property assignments.
	 * A string assigned to a property is always compared.
	 */
	export type ArgumentMatching = 'behavior' | 'strings'

	export type OverrideMode = Extract<Mode, 'live' | 'save' | 'simulate'>
	export type Context = {
		timeTrackers: TimeTracker[]
		plugins: SpecPlugin.Instance[]
		io: IO
		config: {
			overrideMode?: Mode
			filePathFilter?: RegExp
			specNameFilter?: RegExp
			argumentMatching?: ArgumentMatching
		} & Log.Config
		specName: string
		options: Options
		mode: Mode
		specRelativePath: string
	} & Log.Context

	export type IO = {
		/**
		 * Read spec record.
		 * @param specRelativePath file path of where the spec was used relative to:
		 * root of project (`process.cwd()`) for server side usage,
		 * path name (http://host/<path-name>?query) for client side usage.
		 * For example, when used in test, it is the relative path of the test file.
		 */
		readSpec(specName: string, specRelativePath: string): Promise<SpecRecord>
		/**
		 * Write spec record.
		 * @param specRelativePath file path of where the spec was used relative to:
		 * root of project (`process.cwd()`) for server side usage,
		 * path name (http://host/<path-name>?query) for client side usage.
		 * For example, when used in test, it is the relative path of the test file.
		 * @param record serialized SpecRecord.
		 * It is already in serialized form because for `@mocktomata/service`, the `SpecRecord` is already in string.
		 */
		writeSpec(specName: string, specRelativePath: string, record: SpecRecord): Promise<void>
	}

	export type Mode = 'live' | 'save' | 'simulate' | 'auto' | 'mock'

	export type Handler = (specName: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>
	export type MockHandler = (specName: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>

	export type Options = {
		/**
		 * How long will the spec wait before consider the subject failed to return.
		 * Default to 3000 ms.
		 */
		timeout?: number
		/**
		 * Log level to log the behavior.
		 *
		 * Defaults to `logLevels.info` when `emitLog` is false,
		 * Defaults to `logLevels.debug` when `emitLog` is true.
		 *
		 * They are saved in memory and available through the `reporter`.
		 *
		 * If `emitLog` is true, the log will also be printed.
		 */
		logLevel?: number
		/**
		 * Emit the log to console or not.
		 *
		 * By default this is false to avoid cluttering the test result.
		 */
		emitLog?: boolean
		/**
		 * Specify the spec file path.
		 *
		 * If not specify,
		 * it will be detected automatically based on there the `mockto()`, `komondor()`, or `scenario()` is called.
		 *
		 * If you create some wrapping functions so that the calls are not made directly,
		 * you need to specify this so that the spec record will be saved at the correct location.
		 *
		 * You can also use this to organize your spec records for specific use cases,
		 * such as creating different demos.
		 */
		specPath?: string
		/**
		 * Which arguments of function calls and `new` are compared with the record during simulation.
		 * Overrides the `argumentMatching` in the config.
		 *
		 * Default to the config value, or `'behavior'`.
		 * @see Spec.ArgumentMatching
		 */
		argumentMatching?: ArgumentMatching
	}

	export type MaskValueFn = (value: string | RegExp, replaceWith?: string | undefined) => void
}
