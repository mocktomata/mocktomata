import type { SpecPlugin } from '../spec-plugin/types.js'

// istanbul ignore next
const decrementPlugin: SpecPlugin = {
  support: s => typeof s === 'number',
  createSpy: (_, s) => s - 1,
  createStub: (_, s) => s - 1
}

export function activate(context: SpecPlugin.ActivationContext) {
  context.register(decrementPlugin)
}
