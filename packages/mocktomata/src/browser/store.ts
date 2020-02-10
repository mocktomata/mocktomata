import { createStore } from 'global-store'
import { WorkerStore } from '../types'

export const store = createStore<WorkerStore>({
  moduleName: 'mocktomata',
  key: 'f6d1823b-b529-473e-ab84-17cada707ef9',
  version: '7.0.0',
  initializer: current => current
})
