import { SpecRecordLive, SpecReferenceLive } from './types-internal';
import { SpecAction } from './types';

export function addReference(refs: SpecReferenceLive[], ref: SpecReferenceLive) {
  return String(refs.push(ref) - 1)
}

export function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function getRef(record: SpecRecordLive, ref: string | number): SpecReferenceLive | undefined {
  return record.refs[Number(resolveRefId(record, ref))]
}

export function resolveRefId({ actions }: Pick<SpecRecordLive, 'actions'>, ref: string | number) {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}

export function findRefIdByTarget(refs: SpecReferenceLive[], target: any) {
  const id = refs.findIndex(ref => ref.target === target)
  return (id !== -1) ? String(id) : undefined
}

export function findTarget<T>(refs: SpecReferenceLive[], subject: T): T | undefined {
  const ref = refs.find(r => r.subject === subject)
  return ref && ref.target
}
