import { SpecPluginActivationContext } from '@moctomata/framework'
import activateFS from './fs'

export function activate(context: SpecPluginActivationContext) {
  activateFS(context)
}
