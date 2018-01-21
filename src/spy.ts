import { FluxStandardAction } from 'flux-standard-action'

import { createSpecStore } from './specStore'
import { plugin } from './plugin';

export interface Spy<T> {
  on(event: string, callback: (action: FluxStandardAction<any, any>) => void),
  onAny(callback: (action: FluxStandardAction<any, any>) => void),
  actions: FluxStandardAction<any, any>[],
  completed: Promise<FluxStandardAction<any, any>[]>,
  subject: T
}

export function spy<T>(subject: T): Spy<T> {
  const store = createSpecStore()

  let resolve
  const completed = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(store.actions)
    }
  })
  const spied = plugin.getSpy({ resolve, store }, subject)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    completed,
    subject: spied
  } as any
}
