import type { SpecPlugin } from '../spec_plugin/types.js'

export const incrementPlugin: SpecPlugin = {
	name: 'increment',
	support: s => typeof s === 'number',
	createSpy: (_, s) => s + 1,
	createStub: (_, s) => s + 1
}

export function activate(context: SpecPlugin.ActivationContext) {
	context.register(incrementPlugin)
}
