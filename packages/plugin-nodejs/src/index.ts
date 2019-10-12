import { PluginActivationContext } from '@komondor-lab/core'
import activateFS from './fs'

export function activate(context: PluginActivationContext) {
  activateFS(context)
}
