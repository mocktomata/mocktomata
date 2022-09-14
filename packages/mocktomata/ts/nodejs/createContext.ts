import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { createStandardLog, Logger } from 'standard-log'
import { PromiseValue, required } from 'type-plus'
import { Mocktomata } from '../index.js'
import { resolveFilter, resolveLogLevel, resolveMode } from '../utils/index.js'
import { ENV_VARS } from './constants.js'
import { store } from './store.js'

export function createContext(options?: { io?: Mocktomata.IO, log?: Logger }) {
  return new AsyncContext(async () => {
    const log = options?.log || createStandardLog().getLogger('mocktomata')

    const io = options?.io || createIO()
    const ioConfig = await io.getConfig()
    const loadedConfig = getLoadedConfig({ log }, ioConfig)
    const storedConfig = store.value.config
    const envConfig = getEnvConfig({ log })
    const config = required(envConfig, storedConfig, loadedConfig)
    if (config.logLevel) log.level = config.logLevel
    store.value.config = config

    return { config, io, log }
  })
}

function getEnvConfig(ctx: { log: Logger }) {
  return {
    overrideMode: resolveMode(ctx, 'environment', process.env[ENV_VARS.mode]),
    filePathFilter: resolveFilter(process.env[ENV_VARS.fileFilter]),
    specNameFilter: resolveFilter(process.env[ENV_VARS.specFilter]),
    logLevel: resolveLogLevel(ctx, 'environment', process.env[ENV_VARS.log])
  }
}

function getLoadedConfig(ctx: { log: Logger }, config: PromiseValue<ReturnType<Mocktomata.IO['getConfig']>>) {
  if (config.overrideMode) config.overrideMode = resolveMode(ctx, 'config', config.overrideMode)
  if (config.filePathFilter) config.filePathFilter = resolveFilter(config.filePathFilter)
  if (config.specNameFilter) config.specNameFilter = resolveFilter(config.specNameFilter)
  if (config.logLevel) config.logLevel = resolveLogLevel(ctx, 'config', config.logLevel) as any
  return config
}
