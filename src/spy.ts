import { SpecAction } from './interfaces'
import { plugin } from './plugin'
import { createSpecStore } from './specStore'

export interface Spy<T> {
  on(event: string, callback: (action: SpecAction) => void),
  onAny(callback: (action: SpecAction) => void),
  actions: SpecAction[],
  subject: T
}

export function spy<T>(subject: T): Spy<T> {
  const store = createSpecStore()

  const spied = plugin.getSpy(store, subject)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    subject: spied
  } as any
}
