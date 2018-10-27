import { SpecMode } from 'komondor-plugin';
import { store } from './store';

export const runtime = {
  getMode(id: string, mode: SpecMode) {
    const { specOverrides, specDefaultMode } = store.get()
    const override = specOverrides.find(s => {
      if (typeof s.filter === 'string')
        return s.filter === id
      else
        return s.filter.test(id)
    })
    return override ? override.mode : specDefaultMode || mode
  },
  findPlugin() {
    return undefined
  }
}
