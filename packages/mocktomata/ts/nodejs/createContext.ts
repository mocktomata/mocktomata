import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { PromiseValue, required } from 'type-plus'
import { Mocktomata } from '../index.js'
import { log } from '../log.js'
import { resolveFilter, resolveLogLevel, resolveMode } from '../utils/index.js'
import { ENV_VARS } from './constants.js'
import { store } from './store.js'

export function createContext(options?: { io: Mocktomata.IO }) {
  return new AsyncContext(async () => {
    const io = options?.io || createIO()
    const ioConfig = await io.getConfig()
    const loadedConfig = getLoadedConfig(ioConfig)
    const storedConfig = store.value.config
    const envConfig = getEnvConfig()
    const config = required(envConfig, storedConfig, loadedConfig)
    if (config.logLevel) log.level = config.logLevel
    store.value.config = config
    return { config, io }
  })
}

function getEnvConfig() {
  return {
    overrideMode: resolveMode('environment', process.env[ENV_VARS.mode]),
    filePathFilter: resolveFilter(process.env[ENV_VARS.fileFilter]),
    specNameFilter: resolveFilter(process.env[ENV_VARS.specFilter]),
    logLevel: resolveLogLevel('environment', process.env[ENV_VARS.log])
  }
}

function getLoadedConfig(config: PromiseValue<ReturnType<Mocktomata.IO['getConfig']>>) {
  if (config.overrideMode) config.overrideMode = resolveMode('config', config.overrideMode)
  if (config.filePathFilter) config.filePathFilter = resolveFilter(config.filePathFilter)
  if (config.specNameFilter) config.specNameFilter = resolveFilter(config.specNameFilter)
  if (config.logLevel) config.logLevel = resolveLogLevel('config', config.logLevel) as any
  return config
}
