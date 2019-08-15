import { SpecPlugin } from './SpecPlugin';

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void,
}
export type PluginActivationContext = {
  register(plugin: SpecPlugin<any>): void
}
