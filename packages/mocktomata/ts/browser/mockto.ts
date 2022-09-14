import { createMockto, Mocktomata } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { AsyncContext } from 'async-fp'
import { Logger } from 'standard-log'
import { PromiseValue, required } from 'type-plus'
import { log } from '../log.js'
import { resolveFilter, resolveLogLevel, resolveMode } from '../utils/index.js'
import { store } from './store.js'

const context = new AsyncContext(async () => {
  const io = await createIO()
  const loadedConfig = getLoadedConfig({ log }, await io.getConfig())
  const storedConfig = store.value.config
  const config = required(storedConfig, loadedConfig)
  if (config.logLevel) log.level = config.logLevel
  store.value.config = config
  return { config, io, log }
})
export const mockto = createMockto(context)

function getLoadedConfig(ctx: { log: Logger }, config: PromiseValue<ReturnType<Mocktomata.IO['getConfig']>>): Mocktomata.Config {
  if (config.overrideMode) config.overrideMode = resolveMode(ctx, 'config', config.overrideMode)
  if (config.filePathFilter) config.filePathFilter = resolveFilter(config.filePathFilter)
  if (config.specNameFilter) config.specNameFilter = resolveFilter(config.specNameFilter)
  if (config.logLevel) config.logLevel = resolveLogLevel(ctx, 'config', config.logLevel) as any
  return config as any
}
