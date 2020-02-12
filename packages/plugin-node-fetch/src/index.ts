import { SpecPlugin } from '@mocktomata/framework'
import fetch from 'node-fetch'

export function activate(context: SpecPlugin.ActivationContext) {
  context.register({
    support(subject) { return subject === fetch },
    createSpy() { return },
    createStub() { return },
  })
}

