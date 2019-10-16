import { PluginActivationContext } from '@mocktomata/plugin';
import { valuePlugin } from './valuePlugin';

export function activate(activationContext: PluginActivationContext) {
  activationContext.register(valuePlugin)
}
