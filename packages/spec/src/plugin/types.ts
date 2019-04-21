import { RequiredPick } from 'type-plus'

export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<T = any> {
  name?: string,
  support: (subject: any) => boolean,
  getSpy: (context: any, subject: T) => any
  getStub: (context: any, subject: T) => any
  serialize?: (subject: T) => string
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void
}

export type PluginIO = {
  getPluginList(): Promise<string[]>
  loadPlugin(name: string): Promise<PluginModule>
}

export type PluginInstance = RequiredPick<KomondorPlugin, 'name'>
