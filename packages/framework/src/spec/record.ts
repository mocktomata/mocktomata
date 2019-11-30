import { pick } from 'type-plus';
import { ActionMismatch, ExtraReference, ReferenceMismatch, PluginsNotLoaded } from './errors';
import { SpecRecord } from './types';
import { referenceMismatch } from './validations';
import { getPlugin } from './findPlugin';

export function createSpecRecordBuilder(specName: string) {
  const refs: SpecRecord.Reference[] = []
  const actions: SpecRecord.Action[] = []

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

export type SpecRecorderBuilder = ReturnType<typeof createSpecRecordBuilder>

function assertPluginsLoaded(specName: string, refs: SpecRecord.Reference[]) {
  const pluginsInUse = refs.reduce<string[]>((p, v) => {
    if (p.indexOf(v.plugin) === -1) p.push(v.plugin)
    return p
  }, [])

  const pluginsMissing = pluginsInUse.filter(p => {
    try { return !getPlugin(p) }
    catch (e) { return true }
  })
  if (pluginsMissing.length > 0) {
    throw new PluginsNotLoaded(specName, pluginsMissing)
  }
}
export function createSpecRecordValidator(specName: string, loaded: SpecRecord) {
  assertPluginsLoaded(specName, loaded.refs)


  const refs: SpecRecord.Reference[] = []
  const actions: SpecRecord.Action[] = []

  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id),
    getRefId: (ref: SpecRecord.Reference) => getRefId(refs, ref),
    addRef: (ref: SpecRecord.Reference) => {
      const expected = findNextExpectedRefForPlugin(loaded.refs, refs, ref.plugin)
      if (referenceMismatch(ref, expected)) throw new ReferenceMismatch(specName, ref, expected)

      return addRef(refs, ref)
    },
    findRef: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    findRefId: (value: any) => findRefIdBySubjectOrTestDouble(refs, value),

    findNextExpectedRefForPlugin: (plugin: string) => findNextExpectedRefForPlugin(loaded.refs, refs, plugin),
    findLoadedRef: (value: any) => {
      const ref = findRefBySubjectOrTestDouble(loaded.refs, value)
      if (!ref) throw new ExtraReference(specName, value)
      return ref
    },

    getExpectedRef: (id: SpecRecord.ReferenceId) => getRef(loaded, id),
    getNextExpectedRef(): SpecRecord.Reference | undefined {
      return loaded.refs[refs.length]
    },
    getNextExpectedAction(): SpecRecord.Action | undefined { return loaded.actions[actions.length] },
    getNextActionId() { return actions.length },
    addAction: (action: SpecRecord.Action) => addAction(actions, action),
  }
}

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

function findNextExpectedRefForPlugin(loadedRefs: SpecRecord.Reference[], refs: SpecRecord.Reference[], plugin: string) {
  let count = refs.reduce((p, v) => {
    if (v.plugin === plugin) p++
    return p
  }, 0)
  return loadedRefs.find(r => {
    if (r.plugin !== plugin) return false
    return --count
  })
}

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

