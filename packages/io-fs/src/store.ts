import { createStore } from 'global-store'

export type Store = {
  config: any
}

export const store = createStore<Store>({
  moduleName: '@mocktomata/io-fs',
  key: 'a3612524-b212-4485-8145-e14aafb660ae',
  version: '7.0.0',
  initializer: current => ({ config: undefined, ...current })
})

export function resetStore() {
  store.reset()
}
