import { configHandlerStore } from './store';

export function setConfig(options: object) {
  const handlers = configHandlerStore.get()
  handlers.forEach(h => h(options))
}

