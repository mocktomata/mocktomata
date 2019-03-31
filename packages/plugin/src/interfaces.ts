
export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<T extends object = {}> {
  support: (subject: any) => boolean,
  getSpy: any,// getSpy<T>,
  getStub: any,// getStub<T>,
  serialize?: (subject: T) => string
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void
}
