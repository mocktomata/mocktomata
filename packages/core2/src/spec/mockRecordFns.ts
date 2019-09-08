import { ActionId, ReferenceId, SpecAction, SpecRecord, SpecReference } from './types';

export function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function findTestDouble<S>(refs: SpecReference[], subjectOrTestDouble: S): S | undefined {
  const ref = refs.find(r => r.testDouble === subjectOrTestDouble || r.subject === subjectOrTestDouble)
  return ref && ref.testDouble
}

export function addRef(refs: SpecReference[], ref: SpecReference) {
  return String(refs.push(ref) - 1)
}

export function getRef(record: SpecRecord, ref: ReferenceId | ActionId): SpecReference | undefined {
  const refId = typeof ref === 'string' ? ref : resolveRefId(record, ref)
  return record.refs[Number(refId)]
}

export function findRefId(refs: SpecReference[], testDouble: any) {
  const id = refs.findIndex(r => r.testDouble === testDouble)
  return id === -1 ? undefined : String(id)
}

export function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, ref: ReferenceId | ActionId): ReferenceId {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}
