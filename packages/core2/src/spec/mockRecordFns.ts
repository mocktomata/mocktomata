import { SpecReference, SpecAction, SpecRecord, ReferenceId, ActionId } from './types';

export function addRef(refs: SpecReference[], ref: SpecReference) {
  return String(refs.push(ref) - 1)
}

export function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function findTestDouble<S>(refs: SpecReference[], subject: S): S | undefined {
  const ref = refs.find(r => r.subject === subject)
  return ref && ref.testDouble
}

export function getRef(record: SpecRecord, ref: ReferenceId | ActionId): SpecReference | undefined {
  const refId = typeof ref === 'string' ? ref : resolveRefId(record, ref)
  return record.refs[Number(refId)]
}

export function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, ref: ReferenceId | ActionId) {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}
