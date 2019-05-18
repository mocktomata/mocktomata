// istanbul ignore next
export const missSupportPluginModule = {
  activate(context: any) {
    context.register(missSupportPlugin)
  }
}

// istanbul ignore next
export const missSupportPlugin = {
  getSpy() { return {} },
  getStub() { return {} },
  serialize() { return '' }
}
