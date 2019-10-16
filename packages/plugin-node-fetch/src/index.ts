import { SpecPluginActivationContext } from '@mocktomata/framework'
import fetch from 'node-fetch'

export function activate(context: SpecPluginActivationContext) {
  context.register({
    support(subject) { return subject === fetch },
    createSpy() { return },
    createStub() { return },
  })
}

