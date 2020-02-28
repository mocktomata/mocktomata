import { addPluginModule, createMockto, es2015 } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { AsyncContext } from 'async-fp'
import { required } from 'type-plus'
import { log } from '../log'
import { store } from './store'

const context = new AsyncContext(async () => {
  const io = await createIO()
  addPluginModule(es2015.name, es2015)
  const loadedConfig = await io.getConfig()
  log.debug(`loaded config`, loadedConfig)
  const storedConfig = store.value.config
  if (storedConfig) log.debug(`config(...)`, storedConfig)
  const config = required(loadedConfig, storedConfig)
  store.value.config = config
  return { config, io }
}, { lazy: true })
export const mockto = createMockto(context)
