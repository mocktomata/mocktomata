import { PluginActivationContext } from 'komondor'

export function activate(context: PluginActivationContext) {
  context.register(
    'komondor-plugin-fixture-dummy',
    () => false,
    () => { return },
    () => { return },
    () => { return }
  )
}

