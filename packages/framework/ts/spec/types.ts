import type { Logger, MemoryLogReporter } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { SpecRecord } from '../spec-record/types.js'
import type { TimeTracker } from '../timeTracker/index.js'

export type Spec = {
  /**
   * Creates a spec'd subject to capture or replay the behavior
   */
  <S>(subject: S): Promise<S>,
  /**
   * The current mode of the spec.
   */
  readonly mode: Spec.Mode,
  /**
   * Indicates the spec completes.
   * @return the resulting `SpecRecord` for debugging purposes.
   */
  done(): Promise<SpecRecord>,
  ignoreMismatch(value: unknown): void,
  /**
   * Mask some sensitive value from logs and record.
   * @param value value to mask for
   * @param replaceWith value to replace with (Default: `[masked]`)
   */
  maskValue(value: string | RegExp, replaceWith?: string): void,
}

export namespace Spec {
  export type Config = {
    overrideMode?: OverrideMode,
    filePathFilter?: RegExp,
    specNameFilter?: RegExp
  }

  export type OverrideMode = Extract<Mode, 'live' | 'save' | 'simulate'>
  export type Context = {
    timeTrackers: TimeTracker[],
    plugins: SpecPlugin.Instance[],
    log: Logger,
    io: IO,
    config: {
      overrideMode?: Mode,
      filePathFilter?: RegExp,
      specNameFilter?: RegExp
    } & Log.Config,
    specName: string,
    options: Options,
    mode: Mode,
    specRelativePath: string
  }

  export type IO = {
    /**
     * Read spec record.
     * @param specRelativePath file path of where the spec was used relative to:
     * root of project (`process.cwd()`) for server side usage,
     * path name (http://host/<path-name>?query) for client side usage.
     * For example, when used in test, it is the relative path of the test file.
     */
    readSpec(specName: string, specRelativePath: string): Promise<SpecRecord>,
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

  export type Mode = 'live' | 'save' | 'simulate' | 'auto'

  export type Handler = (specName: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>

  export type Options = {
    /**
     * How long will the spec wait before consider the subject failed to return.
     * Default to 3000 ms.
     */
    timeout?: number,
    /**
     * Log level to log the behavior.
     * Default to `logLevels.info`
     *
     * They are saved in memory and available through the `reporter`.
     *
     * If `emitLog` is true, the log will also be printed.
     */
    logLevel?: number,
    /**
     * Emit the log to console or not.
     *
     * By default this is false to avoid cluttering the test result.
     */
    emitLog?: boolean
  }
}
