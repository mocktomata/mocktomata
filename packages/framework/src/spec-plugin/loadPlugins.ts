import { AsyncContext } from 'async-fp'
import { es2015 } from '../es2015'
import { Mocktomata } from '../types'
import { addPluginModule } from './addPluginModule'
import { PluginNotFound } from './errors'
import { SpecPlugin } from './types'

export async function loadPlugins(context: AsyncContext<Mocktomata.Context>) {
  const { config, io } = await context.get()
  // check `config.ecmaVersion` in the future
  const plugins: SpecPlugin.Instance[] = []
  addPluginModule(plugins, es2015.name, es2015)
  const pluginNames = config.plugins
  for (let i = 0; i < pluginNames.length; i++) {
    const name = pluginNames[i]
    await loadPlugin({ io, plugins }, name)
  }
  return { plugins }
}

async function loadPlugin({ io, plugins }: { io: SpecPlugin.IO, plugins: SpecPlugin.Instance[] }, moduleName: string) {
  const pluginModule = await tryLoad(io, moduleName)
  addPluginModule(plugins, moduleName, pluginModule)
}
async function tryLoad(io: SpecPlugin.IO, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch (e) {
    throw new PluginNotFound(name)
  }
}
