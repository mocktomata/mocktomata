import { plugin } from './plugin'
import { createSpecStore } from './specStore'
import { Spy } from './spy'

export async function stub<T>(subject: T, id): Promise<Spy<T>> {
  const store = createSpecStore()
  await store.load(id)

  const stubbed = plugin.getStub(store, subject, id)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    completed: store.completed,
    complete: store.complete,
    subject: stubbed
  } as any
}
