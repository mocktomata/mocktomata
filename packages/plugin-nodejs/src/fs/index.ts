import { SpecPluginActivationContext } from '@mocktomata/framework'
import { readStreamPlugin } from './readStreamPlugin'

export default function activate(context: SpecPluginActivationContext) {
  context.register(readStreamPlugin)
}

