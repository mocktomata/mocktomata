import { pick } from 'type-plus';
import { ActionMismatch } from './errors';
import { ActionId, ReferenceId, SpecAction, SpecRecord, SpecReference } from './types';

export function createSpyingRecord(specName: string) {
  const refs: SpecReference[] = []
  const actions: SpecAction[] = []
  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id),
    addRef: (ref: SpecReference) => addRef(refs, ref),
    findRefBySubjectOrTestDouble: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    getRefId: (ref: SpecReference) => getRefId(refs, ref),
    addAction: (action: SpecAction) => addAction(actions, action),
  }
}

export type SpyRecord = ReturnType<typeof createSpyingRecord>

export function createValidatingRecord(specName: string, expected: SpecRecord) {
  const refs: SpecReference[] = []
  const actions: SpecAction[] = []

  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id),
    getExpectedRef: (id: ReferenceId) => getRef(expected, id),
    getNextExpectedRef(): SpecReference | undefined {
      return expected.refs[refs.length]
    },
    addRef: (ref: SpecReference) => addRef(refs, ref),
    findRefBySubjectOrTestDouble: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    getRefId: (ref: SpecReference) => getRefId(refs, ref),
    findRefId: (value: any) => findRefIdBySubjectOrTestDouble(refs, value),
    getNextExpectedAction(): SpecAction | undefined { return expected.actions[actions.length] },
    getNextActionId() { return actions.length },
    addAction: (action: SpecAction) => addAction(actions, action),
  }
}

export type ValidatingRecord = ReturnType<typeof createValidatingRecord>

function getSpecRecord(refs: SpecReference[], actions: SpecAction[]) {
  return {
    refs: refs.map(ref => pick(ref, 'plugin', 'mode', 'source')),
    actions
  }
}

function getRef(record: SpecRecord, ref: ReferenceId | ActionId): SpecReference | undefined {
  const refId = typeof ref === 'string' ? ref : resolveRefId(record, ref)
  return record.refs[Number(refId)]
}

function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, ref: ReferenceId | ActionId): ReferenceId {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}
function addRef(refs: SpecReference[], ref: SpecReference) {
  return String(refs.push(ref) - 1)
}

function findRefBySubjectOrTestDouble(refs: SpecReference[], value: any) {
  return refs.find(r => r.testDouble === value || r.subject === value)
}

function findRefIdBySubjectOrTestDouble(refs: SpecReference[], value: any) {
  const i = refs.findIndex(r => r.testDouble === value || r.subject === value)
  if (i !== -1) {
    return String(i)
  }
  return undefined
}

function getRefId(refs: SpecReference[], ref: SpecReference) {
  return String(refs.indexOf(ref))
}

function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function assertActionType<T extends SpecAction>(specId: string, type: SpecAction['type'], action: SpecAction | undefined): action is T {
  if (!action || action.type !== type) {
    throw new ActionMismatch(specId, { type } as any, action)
  }
  // workaround before asserts modifier can be used with eslint
  return false
}

