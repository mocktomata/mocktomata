import type { SpecPlugin } from '../spec_plugin/types.js'

export const decrementPlugin: SpecPlugin = {
	name: 'decrement',
	support: s => typeof s === 'number',
	createSpy: (_, s) => s - 1,
	createStub: (_, s) => s - 1
}

export function activate(context: SpecPlugin.ActivationContext) {
	context.register(decrementPlugin)
}
