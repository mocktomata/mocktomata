import { SpecPlugin } from '@mocktomata/framework'
import activateFS from './fs'

export function activate(context: SpecPlugin.ActivationContext) {
  activateFS(context)
}
