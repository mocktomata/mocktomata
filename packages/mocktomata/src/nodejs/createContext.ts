import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { required } from 'type-plus'
import { log } from '../log'
import { store } from './store'

export function createContext() {
  return new AsyncContext(async () => {
    const io = createIO()
    const loadedConfig = await io.getConfig()
    const storedConfig = store.value.config
    const config = required(loadedConfig, storedConfig)
    if (config.logLevel) log.level = config.logLevel
    store.value.config = config
    return { config, io }
  }, { lazy: true })
}
