import { FluxStandardAction } from 'flux-standard-action'

import { plugin } from './plugin'
import { createSpecStore } from './specStore'
import { Spy } from './spy'

export async function stub<T>(subject: T, id): Promise<Spy<T>> {
  const store = createSpecStore()
  await store.load(id)

  let resolve
  const completed = new Promise<FluxStandardAction<any, any>[]>(a => {
    resolve = () => {
      a(store.actions)
    }
  })


  const stubbed = plugin.getStub({ resolve, store }, subject, id)

  return {
    on: store.on,
    onAny: store.onAny,
    actions: store.actions,
    completed,
    subject: stubbed
  } as any
}
