import { InvalidPlugin } from './errors';
import { registerPlugin } from './registerPlugin';

export type PluginContext = {
  io: {
    loadPlugin(id: string): any
  }
}

export async function loadPlugins({ io }: PluginContext, pluginIDs: string[]) {
  return Promise.all(pluginIDs.map(async name => {
    const m = await io.loadPlugin(name)
    if (typeof m.activate !== 'function') {
      throw new InvalidPlugin(name)
    }
    registerPlugin(m)
  }))
}
