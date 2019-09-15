import { ReferenceId, ActionId } from './types'

export type ContextTracker = {
  sourceId: ReferenceId | ActionId,
  sourceSite: Array<string | number>,
}
// export type ContextTracker = ReturnType<typeof createContextTracker>

export function createContextTracker(): ContextTracker {
  return {} as any
}
