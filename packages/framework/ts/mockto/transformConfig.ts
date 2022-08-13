import { AsyncContext } from 'async-fp'
import { Mocktomata } from '../types.js'

export async function transformConfig(context: AsyncContext<Mocktomata.Context>) {
  const { config } = await context.get()
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
