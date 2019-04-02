
export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<T extends object = {}> {
  support: (subject: any) => boolean,
  getSpy: (context: any, subject: T) => any
  getStub: (context: any, subject: T) => any
  serialize?: (subject: T) => string
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void
}

export type PluginInstance = KomondorPlugin & { name: string }

export type PluginIO = {
  getPluginList(): Promise<string[]>
  loadPlugin(name: string): Promise<PluginModule>
}
