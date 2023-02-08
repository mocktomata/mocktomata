import { PluginNotFound } from './errors.js'
import type { SpecPlugin } from './types.js'

export function findPlugin<S>(
	plugins: SpecPlugin.Instance[],
	subject: S
): SpecPlugin.Instance<S> | undefined {
	return plugins.find(p => p.support(subject))
}

export function getPlugin(plugins: SpecPlugin.Instance[], plugin: string) {
	const p = plugins.find(p => p.name === plugin)
	if (!p) throw new PluginNotFound(plugin)
	return p
}
