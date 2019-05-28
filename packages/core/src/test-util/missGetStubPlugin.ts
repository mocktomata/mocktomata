// istanbul ignore next
export const missGetStubPluginModule = {
  activate(context: any) {
    context.register(missGetStubPlugin)
  }
}

// istanbul ignore next
export const missGetStubPlugin = {
  support() { return false },
  createSpy() { return {} },
  serialize() { return '' }
}
