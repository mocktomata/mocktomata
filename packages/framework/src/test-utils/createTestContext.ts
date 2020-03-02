import { AsyncContext } from 'async-fp'
import { es2015 } from '../es2015'
import { store } from '../store'
import { Mocktomata } from '../types'
import { createTestIO } from './createTestIO'
import { required } from 'type-plus'

export function createTestContext(context?: { config: Mocktomata.Config }) {
  const { config } = required({ config: { plugins: [] } }, context)
  store.reset()
  const io = createTestIO()
  io.addPluginModule(es2015.name, es2015)
  config.plugins.push(es2015.name)
  return new AsyncContext({ config, io })
}
