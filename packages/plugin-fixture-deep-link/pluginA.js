module.exports = {
  activate(r) {
    r.register({
      name: '@komondor-lab/plugin-fixture-deep-link-A',
      support() { return false },
      getSpy() { return },
      getStub() { return }
    })
  }
}
