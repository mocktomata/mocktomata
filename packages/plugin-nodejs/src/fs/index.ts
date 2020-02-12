import { SpecPlugin } from '@mocktomata/framework'
import { readStreamPlugin } from './readStreamPlugin'

export default function activate(context: SpecPlugin.ActivationContext) {
  context.register(readStreamPlugin)
}

