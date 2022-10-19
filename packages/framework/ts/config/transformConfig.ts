import type { Omit } from 'type-plus'
import type { Config } from './types.js'

export namespace transformConfig {
  export type ExtendedContext = {
    config: Omit<Config.Context['config'], 'filePathFilter' | 'specNameFilter'>
    & { filePathFilter?: RegExp, specNameFilter?: RegExp }
  }
}

export function transformConfig({ config }: Config.Context): transformConfig.ExtendedContext {
  // filePathFilter not tested because it is troublesome to setup test
  // istanbul ignore next
  return {
    config: {
      ...config,
      filePathFilter: config.filePathFilter ? new RegExp(config.filePathFilter) : undefined,
      specNameFilter: config.specNameFilter ? new RegExp(config.specNameFilter) : undefined
    }
  }
}
