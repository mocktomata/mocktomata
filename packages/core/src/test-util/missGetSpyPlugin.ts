// istanbul ignore next
export const missGetSpyPluginModule = {
  activate(context: any) {
    context.register(missGetSpyPlugin)
  }
}

// istanbul ignore next
export const missGetSpyPlugin = {
  support() { return false },
  getStub() { return {} },
  serialize() { return '' }
}
