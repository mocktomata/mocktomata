import { Logger, LogLevel } from 'standard-log'
import { SpecPlugin } from '../spec-plugin/types.js'
import { SpecRecord } from '../spec-record/types.js'
import { TimeTracker } from '../timeTracker/index.js'

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
    filePathFilter?: string,
    specNameFilter?: string
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
    },
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
     */
    writeSpec(specName: string, specRelativePath: string, record: SpecRecord): Promise<void>
  }

  export type Mode = 'live' | 'save' | 'simulate' | 'auto'

  export type Handler = (title: string, spec: Spec) => void | Promise<any>

  export type Options = {
    timeout: number
  }
}
