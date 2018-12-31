
export type PluginActivationContext = {
  register(
    name: string,
    support: (subject: any) => boolean,
    getSpy: (context: any, subject: any) => any,
    getStub: (context: any, subject: any) => any,
    serialize: (subject: any) => string): void
}

export interface Plugin<T extends object = {}> {
  /**
   * Name of the plugin.
   * This is used to uniquely identify the plugin.
   */
  name: string,
  support: (subject: any) => boolean,
  getSpy: any,// getSpy<T>,
  getStub: any,// getStub<T>,
  serialize?: (subject: T) => string
}


export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void
}
