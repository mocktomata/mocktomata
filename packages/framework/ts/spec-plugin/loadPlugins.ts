import { AsyncContext } from 'async-fp'
import { es2015 } from '../es2015.js'
import { Mocktomata } from '../types.js'
import { addPluginModule } from './addPluginModule.js'
import { PluginNotFound } from './errors.js'
import { SpecPlugin } from './types.js'

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
  catch (e: any) {
    throw new PluginNotFound(name)
  }
}
