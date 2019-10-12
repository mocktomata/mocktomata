import { PluginActivationContext } from '@komondor-lab/core'
import { readStreamPlugin } from './readStreamPlugin'

export default function activate(context: PluginActivationContext) {
  context.register(readStreamPlugin)
}

