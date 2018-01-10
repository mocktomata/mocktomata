import { SpecControl } from './private';

let replay = false

export let store = {
  get replay() {
    return replay
  },
  set replay(value) {
    if (replay !== value) {
      store.specControls.forEach(c => {
        c.options.replay = value
      })
      replay = value
    }
  },
  specControls: [] as SpecControl[]
}
