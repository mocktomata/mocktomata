import type { Mocktomata } from '../types.js'

export async function transformConfig({ config }: Mocktomata.Context) {
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
