import { createMockto } from '@mocktomata/framework'
import { createIO } from '@mocktomata/io-client'
import { AsyncContext } from 'async-fp'
import { required } from 'type-plus'
import { log } from '../log'
import { store } from './store'

const context = new AsyncContext(async () => {
  const io = await createIO()
  const loadedConfig = await io.getConfig()
  const storedConfig = store.value.config
  const config = required(loadedConfig, storedConfig)
  if (config.logLevel) log.level = config.logLevel
  store.value.config = config
  return { config, io }
}, { lazy: true })
export const mockto = createMockto(context)
