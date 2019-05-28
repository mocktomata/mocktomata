// import { PluginActivationContext } from 'komondor-support-utils'

export function activate(context: any) {
  context.register({
    name: '@komondor-lab/plugin-fixture-dummy',
    support() { return false },
    createSpy() { return },
    createStub() { return },
    serialize() { return 'dummy' }
  })
}

