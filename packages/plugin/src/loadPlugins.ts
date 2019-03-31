import { registerPlugin } from './registerPlugin';
import { PluginModule } from './interfaces';

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
    const m = await io.loadPlugin(name)
    registerPlugin(name, m)
  }))
}
