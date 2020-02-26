import { LogLevel } from 'standard-log'
import { SpecRecord } from '../spec-record/types'
import { SpecPlugin } from '../spec-plugin'

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
  enableLog(level?: LogLevel): void,
  getSpecRecord(): SpecRecord,
}

export namespace Spec {
  export type Config = {
    overrideMode?: Mode,
    filePathFilter?: RegExp,
    specNameFilter?: RegExp
  }

  export type Context = {
    plugins: SpecPlugin.Instance[],
    io: IO,
    config: Config,
  }

  export type IO = {
    getConfig(): Promise<Config>,
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
