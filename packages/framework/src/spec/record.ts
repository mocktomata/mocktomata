import { pick, Pick } from 'type-plus';
import { notDefined } from '../constants';
import { ActionMismatch, ExtraReference, PluginsNotLoaded } from './errors';
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin';
import { SpecRecord } from './types';

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

type ValidateRecord = {
  refs: Array<ValidateReference>,
  actions: Array<SpecRecord.Action & {}>,
}

export type ValidateReference = SpecRecord.Reference & { claimed?: boolean }

export function createSpecRecordValidator(specName: string, loaded: ValidateRecord) {
  assertPluginsLoaded(specName, loaded.refs)
  const record: ValidateRecord = {
    refs: loaded.refs.map(r => {
      r.testDouble = notDefined
      r.subject = notDefined
      return r
    }),
    actions: []
  }
  const { refs, actions } = record

  return {
    specName,
    refs,
    actions,
    getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id) as ValidateReference | undefined,
    getRefId: (ref: SpecRecord.Reference) => getRefId(refs, ref),
    getLoadedRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef(loaded, id) as ValidateReference | undefined,
    getLoadedRefId: (ref: SpecRecord.Reference) => getRefId(loaded.refs, ref),
    addRef: (ref: SpecRecord.Reference) => addRef(refs, ref),
    claimNextRef: () => {
      const ref = refs.find(r => !r.claimed)
      if (ref) ref.claimed = true
      return ref
    },
    findRef: (value: any) => {
      let ref = findRefBySubjectOrTestDouble(refs, value)
      if (ref) return ref

      const plugin = findPlugin(value)
      if (!plugin) {
        // `value` is primitive
        return undefined
      }

      ref = refs.find(r => r.plugin === plugin.name && !r.claimed)
      if (ref) {
        ref.claimed = true
        ref.subject = value
        return ref
      }
      return undefined
    },

    findRefId: (value: any) => {
      let ref = findRefBySubjectOrTestDouble(refs, value)
      if (ref) return getRefId(refs, ref)

      const plugin = findPlugin(value)
      if (!plugin) {
        // `value` is primitive
        return undefined
      }

      ref = refs.find(r => r.plugin === plugin.name && !r.claimed)
      if (ref) {
        ref.claimed = true
        ref.subject = value
        return getRefId(refs, ref)
      }
      return undefined
    },

    hasExpectedGetThenAction: (refId: SpecRecord.ReferenceId) => {
      return loaded.actions.some(a => a.type === 'get' && a.refId === refId && a.key === 'then')
    },

    getExpectedResultAction: (actionId: SpecRecord.ActionId) => loaded.actions.find(a => (a.type == 'return' || a.type === 'throw') && a.actionId === actionId) as SpecRecord.ResultActions | undefined,
    addAction: (action: SpecRecord.Action) => {
      return addAction(actions, action)
    },

    // findNextExpectedRefForPlugin: (plugin: string) => findNextExpectedRefForPlugin(record.refs, refs, plugin),
    findNextExpectedGetAction: (
      refId: SpecRecord.ReferenceId,
      performer: SpecRecord.Performer,
      key: SpecRecord.SupportedKeyTypes
    ) => {
      const getActions = loaded.actions.filter(a =>
        a.type === 'get' &&
        a.refId === refId &&
        a.performer === performer &&
        a.key === key
      ) as SpecRecord.GetAction[]

      if (getActions.length === 0) return undefined
      if (getActions.length === 1) return getActions[0]

    },
    findLoadedRef: (value: any) => {
      const ref = findRefBySubjectOrTestDouble(record.refs, value)
      if (!ref) throw new ExtraReference(specName, value)
      return ref
    },

    getExpectedRef: (id: SpecRecord.ReferenceId) => getRef(record, id),
    getNextExpectedAction(): SpecRecord.Action | undefined { return loaded.actions[actions.length] },
    getNextActionId() { return actions.length },
  }
}

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

// function findNextExpectedRefForPlugin(loadedRefs: SpecRecord.Reference[], refs: SpecRecord.Reference[], plugin: string) {
//   let count = refs.reduce((p, v) => {
//     if (v.plugin === plugin) p++
//     return p
//   }, 0)
//   return loadedRefs.find(r => {
//     if (r.plugin !== plugin) return false
//     return --count
//   })
// }
// function findNextExpectedGetAction(
//   { loaded, expected, refsMap }: {
//     loaded: SpecRecord,
//     expected: SpecRecord,
//     refsMap: RefsMap
//   }, {
//     refId,
//     performer,
//     site,
//   }: Pick<SpecRecord.GetAction, 'refId' | 'performer' | 'site'>
// ) {
//   const origRef = refsMap[refId]
//   if (!origRef) return undefined
//   const origRefId = getRefId(loaded.refs, origRef)
//   const getActions = loaded.actions.filter(a =>
//     a.type === 'get' &&
//     a.refId === origRefId &&
//     a.performer === performer &&
//     !siteMismatch(site, a.key)
//   ) as SpecRecord.GetAction[]
//   const resultActions = getActions.map(a => getResultAction(loaded.actions, getActionId(loaded.actions, a)))

//   if (getActions.length === 0) return undefined
//   if (getActions.length === 1) return getActions[0]

// }

// function getActionId(actions: SpecRecord.Action[], action: SpecRecord.Action) {
//   return actions.indexOf(action)
// }

// function getResultAction(actions: SpecRecord.Action[], actionId: SpecRecord.ActionId) {
//   return actions.find((a: any) => a.actionId === actionId)
// }

function getSpecRecord(refs: SpecRecord.Reference[], actions: SpecRecord.Action[]): SpecRecord {
  return {
    refs: refs.map(ref => pick(ref, 'plugin', 'profile', 'source', 'meta')),
    actions
  }
}

function getRef(record: SpecRecord, id: SpecRecord.ReferenceId | SpecRecord.ActionId): SpecRecord.Reference | undefined {
  const refId = typeof id === 'string' ? id : resolveRefId(record, id)
  return record.refs[Number(refId)]
}

function resolveRefId({ actions }: Pick<SpecRecord, 'actions'>, id: SpecRecord.ActionId): SpecRecord.ReferenceId {
  const action = actions[id]
  return action.type === 'return' || action.type === 'throw' ? getCauseAction({ actions }, id).refId : action.refId
}

function getCauseAction({ actions }: { actions: SpecRecord.Action[] }, id: SpecRecord.ActionId) {
  return (actions[id] as SpecRecord.CauseActions)
}

function addRef(refs: SpecRecord.Reference[], ref: SpecRecord.Reference) {
  return String(refs.push(ref) - 1)
}

function findRefBySubjectOrTestDouble<R extends SpecRecord.Reference>(refs: R[], value: any): R | undefined {
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

