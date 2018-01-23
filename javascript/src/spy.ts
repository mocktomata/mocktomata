import { SpecAction } from './interfaces'
import { createSpecStore } from './specStore'
import { plugin } from './plugin';

export interface Spy<T> {
  on(event: string, callback: (action: SpecAction) => void),
  onAny(callback: (action: SpecAction) => void),
  actions: SpecAction[],
  completed: Promise<SpecAction[]>,
  subject: T
}

export function spy<T>(subject: T): Spy<T> {
  const store = createSpecStore()

  const spied = plugin.getSpy(store, subject)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    completed: store.completed,
    subject: spied
  } as any
}
