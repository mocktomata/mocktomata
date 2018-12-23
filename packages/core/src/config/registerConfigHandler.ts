import { configHandlerStore } from './store';

export function registerConfigHandler<T>(handler: (config: T) => void) {
  const handlers = configHandlerStore.get()
  handlers.push(handler)
}
