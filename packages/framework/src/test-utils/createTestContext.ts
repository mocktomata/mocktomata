import { AsyncContext } from 'async-fp'
import { forEachKey, requiredDeep } from 'type-plus'
import { SpecPlugin } from '../spec-plugin/types'
import { Mocktomata } from '../types'
import { createTestIO } from './createTestIO'

export function createTestContext(context?: {
  config?: Partial<Mocktomata.Config>,
  pluginModuleMap?: Record<string, SpecPlugin.Module>
}) {
  const { config, pluginModuleMap } = requiredDeep({ config: { ecmaVersion: '2015', plugins: [] }, pluginModuleMap: {} }, context)
  const io = createTestIO()
  forEachKey(pluginModuleMap, k => io.addPluginModule(k, pluginModuleMap[k]))
  return new AsyncContext({ config, io })
}
