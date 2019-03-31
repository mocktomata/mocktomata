// import { PluginActivationContext } from 'komondor-support-utils'

export function activate(context: any) {
  context.register({
    name: '@komondor-lab/plugin-fixture-dummy',
    support() { return false },
    getSpy() { return },
    getStub() { return },
    serialize() { return 'dummy' }
  })
}

