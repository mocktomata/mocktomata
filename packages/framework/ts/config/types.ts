import { LogMethodNames } from 'standard-log'
import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { Spec } from '../spec/types.js'

export namespace Config {
  export type Input = {
    overrideMode?: Spec.Mode,
    filePathFilter?: string,
    specNameFilter?: string,
    ecmaVersion?: string,
    plugins?: string[],
    logLevel?: LogMethodNames | number
  }

  export type IO = {
    loadConfig(): Promise<Input>
  }
  export type Options = {
    config?: Spec.Config & Partial<SpecPlugin.Config> & Log.Config
  }

  export type Context = {
    config: Spec.Config & SpecPlugin.Config & Log.Config
  }
}
