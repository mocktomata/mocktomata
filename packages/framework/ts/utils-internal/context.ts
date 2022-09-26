import type { SpecRecord } from '../spec-record/types.js'
import type { Recorder } from '../spec/types.internal.js'

export function getPropertyContext<C extends { state: Recorder.State }>(context: C, sourceId: SpecRecord.ActionId, key: SpecRecord.SupportedKeyTypes): C {
  return { ...context, state: { ...context.state, source: { type: 'property', id: sourceId, key } } }
}

export function getThisContext<C extends { state: Recorder.State }>(context: C, sourceId: SpecRecord.ActionId): C {
  return { ...context, state: { ...context.state, source: { type: 'this', id: sourceId } } }
}

export function getArgumentContext<C extends { state: Recorder.State }>(context: C, sourceId: SpecRecord.ActionId, key: number): C {
  return { ...context, state: { ...context.state, source: { type: 'argument', id: sourceId, key } } }
}

export function getResultContext<C extends { state: Recorder.State }>(context: C, sourceId: SpecRecord.ActionId): C {
  return { ...context, state: { ...context.state, source: { type: 'result', id: sourceId } } }
}
