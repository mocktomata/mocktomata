import { PluginActivationContext } from '@komondor-lab/core'
import fetch from 'node-fetch'

export function activate(context: PluginActivationContext) {
  context.register({
    support(subject) { return subject === fetch },
    createSpy() { return },
    createStub() { return },
  })
}

