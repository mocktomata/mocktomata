import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { toLogLevel } from 'standard-log'
import { required } from 'type-plus'
import { Mocktomata } from '..'
import { log } from '../log'
import { ENV_VARS } from './constants'
import { store } from './store'

export function createContext(options?: { io: Mocktomata.IO }) {
  return new AsyncContext(async () => {
    const io = options?.io || createIO()
    const loadedConfig = await io.getConfig()
    const storedConfig = store.value.config
    const envConfig = getEnvConfig()
    const config = required(envConfig, loadedConfig, storedConfig)
    if (config.logLevel) log.level = config.logLevel
    store.value.config = config
    return { config, io }
  }, { lazy: true })
}

function getEnvConfig() {
  return {
    overrideMode: resolveMode('environment', process.env[ENV_VARS.mode]),
    filePathFilter: resolveFilePathFilter(process.env[ENV_VARS.fileFilter]),
    specNameFilter: resplveSpecNameFilter(process.env[ENV_VARS.specFilter]),
    logLevel: resolveLogLevel('environment', process.env[ENV_VARS.log])
  }
}

type SourceType = 'environment' | 'config()' | 'config'
function resolveMode(source: SourceType, value: string | undefined) {
  if (!value) return undefined
  const mode = value.toLowerCase()
  if (mode === 'live' || mode === 'save') return mode

  log.warn(`invalid value for mode. expecting 'live' or 'save', but received ${value} from ${source}`)
  return 'auto'
}

function resolveFilePathFilter(value: string | undefined) {
  return value ? String(value) : undefined
}

function resplveSpecNameFilter(value: string | undefined) {
  return value ? String(value) : undefined
}

function resolveLogLevel(source: SourceType, value: string | undefined) {
  if (!value) return undefined
  const level = toLogLevel(value)
  if (level !== undefined) return level

  log.warn(`invalid value for log level. expecting log level name such as 'DEBUG', but received ${value} from ${source}`)
  return undefined
}
