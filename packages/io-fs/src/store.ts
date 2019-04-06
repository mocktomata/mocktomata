import { createStore } from 'global-store'

export type Store = {
  config: any
}

const store = createStore<Store>('@komondor-lab/io-fs', { config: undefined })


export { store }

export function resetStore() {
  store.set({ config: undefined })
}
