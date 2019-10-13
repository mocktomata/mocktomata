import { SpecPluginActivationContext } from '@komondor-lab/core'
import { readStreamPlugin } from './readStreamPlugin'

export default function activate(context: SpecPluginActivationContext) {
  context.register(readStreamPlugin)
}

