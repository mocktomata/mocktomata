import { PluginActivationContext } from '@komondor-lab/plugin';
import { valuePlugin } from './valuePlugin';

export function activate(activationContext: PluginActivationContext) {
  activationContext.register(valuePlugin)
}
