import { AsyncContext } from 'async-fp'
import { addPluginModule, SpecPlugin } from '../spec-plugin'
import { Mocktomata } from '../types'

export function loadPlugins(context: AsyncContext<Mocktomata.Context>) {
  return context.merge(async () => {
    const { config, io } = await context.get()
    const plugins = [] as SpecPlugin.Instance[]
    for (const plugin of config.plugins) {
      const m = await io.loadPlugin(plugin)
      plugins.push(...addPluginModule(plugin, m))
    }
    return { plugins }
  }, { lazy: true })
}
