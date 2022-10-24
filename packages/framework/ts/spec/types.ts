import type { Logger, LogLevel, MemoryLogReporter } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { SpecRecord } from '../spec-record/types.js'
import type { TimeTracker } from '../timeTracker/index.js'

export type Spec = {
  <S>(subject: S): Promise<S>,
  readonly mode: Spec.Mode,
  done(): Promise<void>,
  enableLog(level?: LogLevel): void,
  ignoreMismatch(value: any): void,
  maskValue(value: number, replaceWith?: number | ((sensitive: number) => number)): void,
  maskValue(value: string, replaceWith?: string | ((sensitive: string) => string)): void,
  maskValue(value: RegExp, replaceWith?: string | ((sensitive: RegExpMatchArray) => string)): void,
  maskValue<V extends number | string>(value: (value: V) => boolean, replaceWith?: V | ((value: V) => V)): void,
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
    // getConfig(): Promise<Config>,
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

  export type Handler = (title: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>

  export type Options = {
    timeout: number
  }
}
