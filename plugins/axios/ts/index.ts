import type { SpecPlugin } from 'mocktomata/plugins'
import { plugin } from './plugin.js'

export function activate(context: SpecPlugin.ActivationContext) {
	context.register(plugin)
}
