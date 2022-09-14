import { AsyncContext } from 'async-fp'
import { Logger } from 'standard-log'
import { es2015 } from '../es2015.js'
import { Mocktomata } from '../types.js'
import { addPluginModule } from './addPluginModule.js'
import { PluginNotFound } from './errors.js'
import { SpecPlugin } from './types.js'

export async function loadPlugins(context: AsyncContext<Mocktomata.Context>) {
  const { config, io, log } = await context.get()
  // check `config.ecmaVersion` in the future
  const plugins: SpecPlugin.Instance[] = []
  addPluginModule({ log }, plugins, es2015.name, es2015)
  const pluginNames = config.plugins
  for (let i = 0; i < pluginNames.length; i++) {
    const name = pluginNames[i]
    await loadPlugin({ io, plugins, log }, name)
  }
  return { plugins }
}

async function loadPlugin({ io, log, plugins }: {
  io: SpecPlugin.IO,
  plugins: SpecPlugin.Instance[],
  log: Logger
}, moduleName: string) {
  log.debug('loadPlugin:', moduleName)
  const pluginModule = await tryLoad(io, moduleName)
  addPluginModule({ log }, plugins, moduleName, pluginModule)
}
async function tryLoad(io: SpecPlugin.IO, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch (e: any) {
    throw new PluginNotFound(name)
  }
}
