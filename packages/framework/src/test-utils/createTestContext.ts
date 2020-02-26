import { AsyncContext } from 'async-fp'
import { es2015 } from '../es2015'
import { createTestIO } from '../incubator/createTestIO'
import { store } from '../store'
import { SpecPlugin } from '../spec-plugin'
import { getCallerRelativePath } from './getCallerRelativePath'

export function createTestContext({ config }: { config: SpecPlugin.Config } = { config: { plugins: [] } }) {
  store.reset()
  const io = createTestIO()
  io.addPluginModule(es2015.name, es2015)
  config.plugins.push(es2015.name)
  return new AsyncContext({
    config,
    io,
    getCallerRelativePath
  })
}
