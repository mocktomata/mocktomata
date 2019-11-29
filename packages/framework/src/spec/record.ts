import { pick } from 'type-plus';
import { ActionMismatch } from './errors';
import { SpecRecord } from './types';

export function createRecord(specName: string, { refs, actions }: SpecRecord = { refs: [], actions: [] }) {
  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id),
    getRefId: (ref: SpecRecord.Reference) => getRefId(refs, ref),
    addRef: (ref: SpecRecord.Reference) => addRef(refs, ref),
    findRef: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    findRefId: (value: any) => findRefIdBySubjectOrTestDouble(refs, value),
    addAction: (action: SpecRecord.Action) => addAction(actions, action),
  }
}

export type Record = ReturnType<typeof createRecord>

export function createValidatingRecord(specName: string, expected: SpecRecord) {
  const refs: SpecRecord.Reference[] = []
  const actions: SpecRecord.Action[] = []

  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id),
    getExpectedRef: (id: SpecRecord.ReferenceId) => getRef(expected, id),
    getNextExpectedRef(): SpecRecord.Reference | undefined {
      return expected.refs[refs.length]
    },
    addRef: (ref: SpecRecord.Reference) => addRef(refs, ref),
    getRefId: (ref: SpecRecord.Reference) => getRefId(refs, ref),
    findRef: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    findRefId: (value: any) => findRefIdBySubjectOrTestDouble(refs, value),
    getNextExpectedAction(): SpecRecord.Action | undefined { return expected.actions[actions.length] },
    getNextActionId() { return actions.length },
    addAction: (action: SpecRecord.Action) => addAction(actions, action),
  }
}

export type ValidatingRecord = ReturnType<typeof createValidatingRecord>

function getSpecRecord(refs: SpecRecord.Reference[], actions: SpecRecord.Action[]): SpecRecord {
  return {
    refs: refs.map(ref => pick(ref, 'plugin', 'profile', 'source', 'meta')),
    actions
  }
}

function getRef(record: SpecRecord, ref: SpecRecord.ReferenceId | SpecRecord.ActionId): SpecRecord.Reference | undefined {
  const refId = typeof ref === 'string' ? ref : resolveRefId(record, ref)
  return record.refs[Number(refId)]
}

function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, ref: SpecRecord.ReferenceId | SpecRecord.ActionId): SpecRecord.ReferenceId {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}
function addRef(refs: SpecRecord.Reference[], ref: SpecRecord.Reference) {
  return String(refs.push(ref) - 1)
}

function findRefBySubjectOrTestDouble(refs: SpecRecord.Reference[], value: any) {
  return refs.find(r => r.testDouble === value || r.subject === value)
}

function findRefIdBySubjectOrTestDouble(refs: SpecRecord.Reference[], value: any) {
  const i = refs.findIndex(r => r.testDouble === value || r.subject === value)
  if (i !== -1) {
    return String(i)
  }
  return undefined
}

function getRefId(refs: SpecRecord.Reference[], ref: SpecRecord.Reference) {
  return String(refs.indexOf(ref))
}

function addAction(actions: SpecRecord.Action[], action: SpecRecord.Action) {
  return actions.push(action) - 1
}

export function assertActionType<T extends SpecRecord.Action>(specId: string, type: SpecRecord.Action['type'], action: SpecRecord.Action | undefined): asserts action is T {
  if (!action || action.type !== type) {
    throw new ActionMismatch(specId, { type } as any, action)
  }
}

