import { pick } from 'type-plus'
import { notDefined } from '../constants'
import { SpecPlugin } from '../spec-plugin'
import { findPlugin } from '../spec-plugin/findPlugin'
import { SpecRecord } from '../spec-record/types'
import { createMaskFn, maskValue } from './masking'
import { MaskCriterion, SpecRecordLive } from './types-internal'

export function createSpecRecordBuilder(specName: string) {
  const refs: SpecRecordLive.Reference[] = []
  const actions: SpecRecordLive.Action[] = []

  return {
    specName,
    refs,
    actions,
    getSpecRecord: (maskValues: MaskCriterion[]) => getSpecRecord(refs, actions, maskValues),
    // getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id),
    // getRefId: (ref: SpecRecordLive.Reference) => getRefId(refs, ref),
    addRef: (ref: SpecRecordLive.Reference) => addRef(refs, ref),
    findRef: (value: any) => findRefBySubjectOrTestDouble(refs, value),
    findRefId: (value: any) => findRefIdBySubjectOrTestDouble(refs, value),
    addAction: (action: SpecRecordLive.Action) => addAction(actions, action),
  }
}

export type SpecRecorderBuilder = ReturnType<typeof createSpecRecordBuilder>

type ValidateRecord = {
  refs: Array<ValidateReference>,
  actions: Array<SpecRecordLive.Action & {}>,
}

export type ValidateReference = SpecRecordLive.Reference & { claimed?: boolean }

export function createSpecRecordValidator(specName: string, loaded: SpecRecord) {
  const record: ValidateRecord = {
    refs: loaded.refs.map(r => ({
      ...r,
      overrideProfiles: [],
      testDouble: notDefined,
      subject: notDefined,
    })),
    actions: []
  }
  const { refs, actions } = record
  let plugins: SpecPlugin.Instance[]

  return {
    specName,
    refs,
    actions,
    setPlugins(instances: SpecPlugin.Instance[]) {
      plugins = instances
    },
    // getSpecRecord: () => getSpecRecord(refs, actions),
    getRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef({ refs, actions }, id) as ValidateReference | undefined,
    getRefId: (ref: SpecRecord.Reference) => getRefId(refs, ref),
    getLoadedRef: (id: SpecRecord.ReferenceId | SpecRecord.ActionId) => getRef(loaded, id),
    getLoadedRefId: (ref: SpecRecord.Reference) => getRefId(loaded.refs, ref),
    // addRef: (ref: SpecRecord.Reference) => addRef(refs, ref),
    // claimNextRef: () => {
    //   const ref = refs.find(r => !r.claimed)
    //   if (ref) ref.claimed = true
    //   return ref
    // },
    findRef: (value: any) => {
      let ref = findRefBySubjectOrTestDouble(refs, value)
      if (ref) return ref

      const plugin = findPlugin(plugins, value)
      // `value` is primitive
      if (!plugin) return undefined

      ref = refs.find(r => r.plugin === plugin.name && !r.claimed)
      if (ref) {
        ref.claimed = true
        ref.subject = value
        return ref
      }
      return undefined
    },

    findRefId: (value: any) => {
      const ref = findRefBySubjectOrTestDouble(refs, value)
      return ref ? getRefId(refs, ref) : undefined
    },

    // hasExpectedGetThenAction: (refId: SpecRecord.ReferenceId) => {
    //   return loaded.actions.some(a => a.type === 'get' && a.refId === refId && a.key === 'then')
    // },

    getExpectedResultAction: (actionId: SpecRecord.ActionId) => loaded.actions.find(a => (a.type == 'return' || a.type === 'throw') && a.actionId === actionId) as SpecRecord.ResultActions | undefined,
    addAction: (action: SpecRecordLive.Action) => {
      return addAction(actions, action)
    },

    // findNextExpectedRefForPlugin: (plugin: string) => findNextExpectedRefForPlugin(record.refs, refs, plugin),
    // findNextExpectedGetAction: (
    //   refId: SpecRecord.ReferenceId,
    //   performer: SpecRecord.Performer,
    //   key: SpecRecord.SupportedKeyTypes
    // ) => {
    //   const getActions = loaded.actions.filter(a =>
    //     a.type === 'get' &&
    //     a.refId === refId &&
    //     a.performer === performer &&
    //     a.key === key
    //   ) as SpecRecord.GetAction[]

    //   if (getActions.length === 0) return undefined
    //   if (getActions.length === 1) return getActions[0]

    // },
    // findLoadedRef: (value: any) => {
    //   const ref = findRefBySubjectOrTestDouble(record.refs, value)
    //   if (!ref) throw new ExtraReference(specName, value)
    //   return ref
    // },

    // getExpectedRef: (id: SpecRecord.ReferenceId) => getRef(record, id),
    getNextExpectedAction(): SpecRecordLive.Action | undefined { return loaded.actions[actions.length] },
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

function getSpecRecord(refs: SpecRecordLive.Reference[], actions: SpecRecordLive.Action[], maskCriteria: MaskCriterion[]): SpecRecord {
  const record = {
    refs: refs.map(ref => pick(ref, 'plugin', 'profile', 'source', 'meta', 'inert')),
    actions
  }
  if (maskCriteria.length > 0) {
    return maskCriteria.reduce((record, criterion) => maskRecord(record, criterion), record as SpecRecord)
  }
  return record
}

function maskRecord(record: SpecRecord, criterion: MaskCriterion) {
  const maskFn = createMaskFn(criterion)
  record.refs.forEach(ref => ref.meta = maskValue(ref.meta, maskFn))
  return record
}


function getRef(record: SpecRecord, id: SpecRecord.ReferenceId | SpecRecord.ActionId): SpecRecord.Reference | undefined {
  const refId = typeof id === 'string' ? id : resolveRefId(record.actions, id)
  return record.refs[Number(refId)]
}

function resolveRefId(actions: SpecRecordLive.Action[], id: SpecRecord.ActionId): SpecRecord.ReferenceId {
  // ReturnAction|ThrowAction never reach here as they are resolved in different means (nextAction)
  return (actions[id] as SpecRecord.CauseActions).refId
}

function addRef(refs: SpecRecord.Reference[], ref: SpecRecord.Reference) {
  return String(refs.push(ref) - 1)
}

function findRefBySubjectOrTestDouble<R extends ValidateReference>(refs: R[], value: any): R | undefined {
  const ref = refs.find(r => r.testDouble === value || r.subject === value)
  if (ref) return ref
  const nextRef = refs.find(r => !r.claimed)
  if (nextRef?.inert) {
    // special handling for inert value.
    // setting subject to the meta to use the recorded value
    nextRef.subject = nextRef.meta
    return nextRef
  }
  return undefined
}

function findRefIdBySubjectOrTestDouble(refs: SpecRecordLive.Reference[], value: any) {
  const i = refs.findIndex(r => r.testDouble === value || r.subject === value)
  if (i !== -1) return String(i)
  return undefined
}

function getRefId<R>(refs: R[], ref: R) {
  return String(refs.indexOf(ref))
}

function addAction(actions: SpecRecordLive.Action[], action: SpecRecordLive.Action) {
  return actions.push(action) - 1
}
