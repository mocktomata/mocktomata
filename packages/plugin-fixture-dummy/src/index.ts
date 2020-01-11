import { SpecPluginActivationContext } from '@mocktomata/framework'
export function activate(context: SpecPluginActivationContext) {
  context.register({
    name: '@mocktomata/plugin-fixture-dummy',
    support() { return false },
    createSpy() { return },
    createStub() { return },
  })
}

