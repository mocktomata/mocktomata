import { AsyncContext } from 'async-fp'
import { Mocktomata } from '../types'

export async function transformConfig(context: AsyncContext<Mocktomata.Context>) {
  const { config } = await context.get()
  return {
    config: {
      ...config,
      filePathFilter: config.filePathFilter ? new RegExp(config.filePathFilter) : undefined,
      specNameFilter: config.specNameFilter ? new RegExp(config.specNameFilter) : undefined
    }
  }
}
