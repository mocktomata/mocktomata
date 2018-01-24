import { SpecAction } from './interfaces'
import { plugin } from './plugin'
import { createSpecStore } from './specStore'

export interface Spy<T> {
  on(event: string, callback: (action: SpecAction) => void),
  onAny(callback: (action: SpecAction) => void),
  actions: SpecAction[],
  /**
   * Wait until the recording is completed.
   */
  completed: Promise<SpecAction[]>,
  /**
   * Tell the spy that all recordings are completed.
   */
  complete(): Promise<SpecAction[]>,
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
    complete: store.complete,
    subject: spied
  } as any
}
