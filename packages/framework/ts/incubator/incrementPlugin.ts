import { SpecPlugin } from '../spec-plugin'

// istanbul ignore next
const incrementPlugin: SpecPlugin = {
  support: s => typeof s === 'number',
  createSpy: (_, s) => s + 1,
  createStub: (_, s) => s + 1
}

export function activate(context: SpecPlugin.ActivationContext) {
  context.register(incrementPlugin)
}
