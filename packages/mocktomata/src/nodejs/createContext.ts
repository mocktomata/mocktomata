import { createIO } from '@mocktomata/io-local'
import { AsyncContext } from 'async-fp'
import { required } from 'type-plus'
import { log } from '../log'
import { store } from './store'

export function createContext() {
  return new AsyncContext(async () => {
    const io = createIO()
    const loadedConfig = await io.getConfig()
    log.debug(`loaded config`, loadedConfig)
    const storedConfig = store.value.config
    if (storedConfig) log.debug(`config(...)`, storedConfig)
    const config = required(loadedConfig, storedConfig)
    store.value.config = config
    return { config, io }
  }, { lazy: true })
}
