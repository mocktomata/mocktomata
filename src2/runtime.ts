import { SpecMode } from 'komondor-plugin';
import { store } from './store';

export const runtime = {
  getMode(id: string, mode: SpecMode) {
    const override = store.specOverrides.find(s => {
      if (typeof s.filter === 'string')
        return s.filter === id
      else
        return s.filter.test(id)
    })
    return override ? override.mode :
      store.specDefaultMode || mode
  },
  findPlugin(subject) {
    return undefined
  }
}
