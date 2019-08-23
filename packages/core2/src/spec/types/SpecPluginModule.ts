import { SpecPlugin } from './SpecPlugin';

export type SpecPluginModule = {
  activate: (activationContext: SpecPluginActivationContext) => void,
}
export type SpecPluginActivationContext = {
  register(plugin: SpecPlugin): void
}

export type SpecPluginModuleIO = {
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<SpecPluginModule>,
}
