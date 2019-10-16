import { SpecPluginActivationContext } from '@mocktomata/framework'
import activateFS from './fs'

export function activate(context: SpecPluginActivationContext) {
  activateFS(context)
}
