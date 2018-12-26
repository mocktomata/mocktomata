
export type PluginActivationContext = {
  register(name: string, support: (subject: any) => boolean, getSpy: (subject: any) => any, getStub: (subject: any) => any, serialize: any): void
}
