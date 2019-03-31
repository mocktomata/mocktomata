import { registerPlugin } from './registerPlugin';
import { PluginModule } from './interfaces';
import { PluginNotFound } from './errors';

export type PluginContext = {
  io: {
    loadPlugin(name: string): Promise<PluginModule>
  }
}

/**
 * Load plugins to the system.
 */
export async function loadPlugins({ io }: PluginContext, pluginNames: string[]) {
  return Promise.all(pluginNames.map(async name => {
    const m = await tryLoad({ io }, name)
    registerPlugin(name, m)
  }))
}

async function tryLoad({ io }: PluginContext, name: string) {
  try {
    return await io.loadPlugin(name)
  }
  catch {
    throw new PluginNotFound(name)
  }
}
