import { PluginActivationContext } from 'komondor'

export function activate(context: PluginActivationContext) {
  context.register(
    '@komondor-lab/plugin-fixture-dummy',
    () => false,
    () => { return },
    () => { return },
    () => { return }
  )
}

