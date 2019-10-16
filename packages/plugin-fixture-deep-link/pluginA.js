module.exports = {
  activate(r) {
    r.register({
      name: '@mocktomata/plugin-fixture-deep-link-A',
      support() { return false },
      createSpy() { return },
      createStub() { return }
    })
  }
}
