let mode = 'verify'

export let store = {
  get mode() {
    return mode
  },
  set mode(value) {
    if (mode !== value) {
      // store.specControls.forEach(c => {
      //   c.options.mode = value
      // })
      mode = value
    }
  },
  specControls: [] as any[]
}
