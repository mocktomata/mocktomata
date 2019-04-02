import { PluginNotFound } from './errors';
import { PluginIO } from './interfaces';
import { registerPlugin } from './registerPlugin';

export type LoadPluginContext = {
  io: PluginIO
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: LoadPluginContext) {
  const pluginNames = await io.getPluginList()
  return Promise.all(pluginNames.map(async name => {
    const m = await tryLoad({ io }, name)
    registerPlugin(name, m)
  }))
}

async function tryLoad({ io }: LoadPluginContext, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch {
    throw new PluginNotFound(name)
  }
}
