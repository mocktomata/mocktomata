import type { MemoryLogReporter } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec_plugin/types.js'
import type { SpecRecord } from '../spec_record/types.js'
import type { TimeTracker } from '../time_trackter/index.js'

export type Spec = {
	/**
	 * Creates a spec'd subject to capture or replay the behavior
	 */
	<S>(subject: S, options?: { mock?: Partial<S> }): Promise<S>
} & Spec.Base

export type MockSpec = {
	/**
	 * Creates a spec'd subject to capture or replay the behavior
	 */
	<S>(subject: S, options: { mock: Partial<S> }): Promise<S>
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
	}

	export type OverrideMode = Extract<Mode, 'live' | 'save' | 'simulate'>
	export type Context = {
		timeTrackers: TimeTracker[]
		plugins: SpecPlugin.Instance[]
		io: IO
		config: {
			overrideMode?: Mode
			filePathFilter?: RegExp
			specNameFilter?: RegExp
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
	export type MockHandler = (
		specName: string,
		spec: MockSpec,
		reporter: MemoryLogReporter
	) => void | Promise<any>

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
		 * Specify the relative path of of the spec relative to the root of the project.
		 *
		 * If not specify,
		 * it will be detected automatically based on there the `mockto()`, `komondor()`, or `scenario()` is called.
		 *
		 * If you create some wrapping functions so that the calls are not made directly,
		 * specify this so that the spec record will be saved at the correct location.
		 *
		 * You can also use this to organize your spec records for specific use cases,
		 * such as creating different demos.
		 */
		specRelativePath?: string
	}

	export type MaskValueFn = (value: string | RegExp, replaceWith?: string | undefined) => void
}
