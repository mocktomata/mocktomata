import { SpyRecord } from './createSpyRecord';
import { ActionId, ReferenceId } from './types';

export type CircularReference = {
  sourceId: ReferenceId | ActionId,
  sourceSite: Array<keyof any>,
  subjectId: ReferenceId,
}

export function fixCircularReferences(record: Pick<SpyRecord, 'getRef'>, subjectRefId: ReferenceId, cirRefs: CircularReference[]) {
  const refs = cirRefs.filter(cr => cr.subjectId === subjectRefId)
  if (refs.length === 0) return

  const subjectRef = record.getRef(subjectRefId)!
  refs.forEach(ref => {
    const { sourceId, sourceSite } = ref
    if (sourceSite.length > 0) {
      const ref = record.getRef(sourceId)!
      const name = sourceSite.pop()!
      sourceSite.reduce((p, v) => p[v], ref.testDouble)[name] = subjectRef.testDouble
    }
    cirRefs.splice(cirRefs.indexOf(ref), 1)
  })
}
