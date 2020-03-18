import { AsyncContext } from 'async-fp'
import { PartialPick, Pick } from 'type-plus'
import { notDefined } from '../constants'
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin'
import { SpecPlugin } from '../spec-plugin/types'
import { SpecRecord } from '../spec-record/types'
import { createTimeTracker } from '../timeTracker/createTimeTracker'
import { getArgumentContext, getPropertyContext, getResultContext, getThisContext } from '../utils-internal'
import { logAction, logCreateSpy, logRecordingTimeout } from './logs'
import { maskIfNeeded } from './masking'
import { createSpecRecordBuilder } from './record'
import { getDefaultPerformer } from './subjectProfile'
import { Spec } from './types'
import { createSpec, MaskCriterion, Recorder, SpecRecordLive } from './types-internal'

export function createRecorder(context: AsyncContext<createSpec.Context>, specName: string, options: Spec.Options) {
  // istanbul ignore next
  const timeTracker = createTimeTracker(options, elasped => logRecordingTimeout(specName, elasped))
  const ctx = context.extend(async context => {
    const { timeTrackers } = await context.get()
    timeTrackers.push(timeTracker)
    return { timeTracker }
  })
  const record = createSpecRecordBuilder(specName)

  let c: Promise<PartialPick<Recorder.Context, 'state'>>
  async function getContext() {
    if (c) return c
    return c = ctx.extend<
      Pick<Recorder.Context, 'record' | 'spyOptions'>
    >({ record, spyOptions: [] }).get()
  }
  return {
    createSpy: <S>(subject: S) => getContext().then(ctx => createSpy(ctx, subject, { profile: 'target' })),
    end: () => timeTracker.stop(),
    getSpecRecord: (maskValues: MaskCriterion[]) => record.getSpecRecord(maskValues),
    addInertValue: (value: any) => getContext().then(ctx => setSpyOptions(ctx, value, { plugin: '@mocktomata/inert', inert: true })),
    addMaskValue: (value: any, replaceWith: any) => getContext().then(({ maskCriteria }) => maskCriteria.push({ value, replaceWith }))
  }
}

function createSpy<S>(context: PartialPick<Recorder.Context, 'state'>, subject: S, options: { profile: SpecRecord.SubjectProfile }) {
  const spyOption = context.spyOptions.find(o => o.subject === subject)
  const plugin = spyOption?.options.plugin ? getPlugin(context.plugins, spyOption.options.plugin) : findPlugin(context.plugins, subject)
  // this is a valid case because there will be new feature in JavaScript that existing plugin will not support
  // istanbul ignore next
  if (!plugin) return undefined

  const profile = options.profile

  // Possible sources:
  // spec subject: undefined
  // getProperty on object/function/class/instance.promise: { actionId: getId, site: [propertyName] }
  // getProperty on complex plugin: { actionId: getId, site: [...propPath] }
  // invoke argument: { actionId: invokeId, site: [argIndex] }
  // invoke return: { actionId: returnId }
  // invoke throw: { actionId: throwId }
  // instantiate argument: { actionId: instantiateId, site: [argIndex] }
  // getSpyId from array: no source
  const source = context.state?.source
  const ref: SpecRecordLive.Reference = { plugin: plugin.name, profile, overrideProfiles: [], subject, testDouble: notDefined, source }
  if (spyOption?.options.inert) ref.inert = true
  const refId = context.record.addRef(ref)
  const state = { ref, refId }
  logCreateSpy(state, context.maskCriteria, profile, subject)
  return ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state }), subject)
}

export function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext<any> {
  return {
    setSpyOptions: (subject, options) => setSpyOptions(context, subject, options),
    setMeta: meta => setMeta(context, meta),
    getSpyId: value => getSpyId(context, value),
    getProperty: (options, handler) => getProperty(context, options, handler),
    setProperty: (options, handler) => setProperty(context, options, handler),
    invoke: (options, handler) => invoke(context, options, handler),
    instantiate: (options, handler) => instantiate(context, options, handler),
  }
}

export function getSpy<S>(context: Recorder.Context, subject: S, options: { profile?: SpecRecord.SubjectProfile }): S {
  const { record, state, plugins } = context

  const sourceRef = state.ref
  const profile = options.profile || sourceRef.profile

  const ref = record.findRef(subject)
  if (ref) {
    if (ref.testDouble === notDefined) {
      const plugin = getPlugin(plugins, ref.plugin)
      ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state: { ...state, source: undefined } }), ref.subject)
    }
    return ref.testDouble
  }
  return createSpy(context, subject, { profile }) || subject
}

function getSpyId<V>(context: Recorder.Context, value: V) {
  const { record } = context
  const spy = getSpy(context, value, {})
  return record.findRefId(spy) || value
}

function setSpyOptions(context: { spyOptions: Recorder.SpyOption[] }, subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options) {
  context.spyOptions.push({ subject, options })
}

function setMeta<M extends SpecRecord.Meta>({ state }: Recorder.Context, meta: M) {
  return state.ref.meta = meta
}

function getProperty<V>(
  context: Recorder.Context,
  { key, performer }: SpecPlugin.SpyContext.getProperty.Options,
  handler: SpecPlugin.SpyContext.getProperty.Handler<V>
): V {
  const { record, timeTracker, state } = context
  const action: SpecRecord.GetAction = {
    type: 'get',
    refId: state.refId,
    performer: performer || getDefaultPerformer(state.ref.profile),
    tick: timeTracker.elaspe(),
    key,
  }
  const actionId = record.addAction(action)
  logAction(context.state, actionId, action)
  return handleResult(context, actionId, action.type, handler)
}

function setProperty<V, R>(
  context: Recorder.Context,
  { key, value, performer }: SpecPlugin.SpyContext.setProperty.Options<V>,
  handler: SpecPlugin.SpyContext.setProperty.Handler<V, R>
): R {
  const { record, timeTracker, state } = context
  const action: SpecRecord.SetAction = {
    type: 'set',
    refId: state.refId,
    performer: performer || getDefaultPerformer(state.ref.profile),
    tick: timeTracker.elaspe(),
    key,
    value: notDefined
  }

  const actionId = record.addAction(action)

  return handleResult(context, actionId, action.type, () => {
    const spiedValue = getSpy(getPropertyContext(context, actionId, key), value, { profile: getPropertyProfile(state.ref.profile) })
    action.value = record.findRefId(spiedValue) || value
    logAction(context.state, actionId, action)
    return handler(spiedValue)
  })
}

function invoke<V, T, A extends any[]>(
  context: Recorder.Context,
  { thisArg, args, performer, site }: SpecPlugin.SpyContext.invoke.Options<T, A>,
  handler: SpecPlugin.SpyContext.invoke.Handler<V, T, A>) {
  const { record, state, timeTracker } = context

  const action: SpecRecord.InvokeAction = {
    type: 'invoke',
    refId: state.refId,
    performer: performer || getDefaultPerformer(state.ref.profile),
    site,
    thisArg: notDefined,
    payload: [],
    tick: timeTracker.elaspe(),
  }
  const actionId = record.addAction(action)

  return handleResult(context, actionId, action.type, () => {
    const spiedThisArg = getSpy(getThisContext(context, actionId), thisArg, { profile: getThisProfile(state.ref.profile) })
    action.thisArg = record.findRefId(spiedThisArg)!

    const spiedArgs = args.map((arg, key) => {
      const spiedArg = getSpy(getArgumentContext(context, actionId, key), arg, { profile: getArgumentProfile(state.ref.profile) })
      action.payload.push(record.findRefId(spiedArg) ?? arg)
      return spiedArg
    })
    logAction(context.state, actionId, action)
    return handler({ thisArg: spiedThisArg, args: spiedArgs as A })
  })
}

function instantiate<V, A extends any[]>(
  context: Recorder.Context,
  { args, performer }: SpecPlugin.SpyContext.instantiate.Options<A>,
  handler: SpecPlugin.SpyContext.instantiate.Handler<V, A>
): V {
  const { record, state, timeTracker } = context
  performer = performer || getDefaultPerformer(state.ref.profile)

  const action: SpecRecord.InstantiateAction = {
    type: 'instantiate',
    refId: state.refId,
    performer,
    payload: [],
    tick: timeTracker.elaspe(),
  }
  const actionId = record.addAction(action)

  return handleResult(context, actionId, action.type, () => {
    const spiedArgs = args.map((arg, key) => {
      const spiedArg = getSpy(getArgumentContext(context, actionId, key), arg, { profile: getArgumentProfile(state.ref.profile) })
      action.payload.push(record.findRefId(spiedArg) || arg)
      return spiedArg
    }) as A
    logAction(context.state, actionId, action)
    return handler({ args: spiedArgs })
  })
}

function handleResult(
  context: Recorder.Context,
  actionId: SpecRecord.ActionId,
  actionType: SpecRecord.CauseActions['type'],
  handler: () => any
) {
  try {
    return addResultAction(context, actionId, actionType, 'return', handler())
  }
  catch (e) {
    throw addResultAction(context, actionId, actionType, 'throw', e)
  }
}
function addResultAction(
  context: Recorder.Context,
  actionId: SpecRecord.ActionId,
  actionType: SpecRecord.CauseActions['type'],
  type: 'return' | 'throw',
  subject: any
) {
  const { record, timeTracker } = context
  const action = { type, actionId, tick: timeTracker.elaspe(), payload: notDefined }
  const id = record.addAction(action)
  const resultContext = getResultContext(context, actionId)
  const spy = getSpy(resultContext, subject, { profile: getResultProfile(context.state.ref.profile, actionType) })
  const refId = record.findRefId(spy)
  action.payload = refId !== undefined ? refId : subject
  logAction(resultContext.state, id, action)
  return maskIfNeeded(context.maskCriteria, spy)
}

function getPropertyProfile(parentProfile: SpecRecord.SubjectProfile) {
  return getSubjectProfile(parentProfile)
}
function getThisProfile(parentProfile: SpecRecord.SubjectProfile) {
  return getSubjectProfile(parentProfile)
}

function getArgumentProfile(parentProfile: SpecRecord.SubjectProfile) {
  return getSubjectProfile(parentProfile)
}

function getSubjectProfile(parentProfile: SpecRecord.SubjectProfile): SpecRecord.SubjectProfile {
  switch (parentProfile) {
    case 'target': return 'input'
    case 'input': return 'output'
    case 'output': return 'input'
  }
}

function getResultProfile(
  parentProfile: SpecRecord.SubjectProfile,
  actionType: SpecRecord.CauseActions['type'],
): SpecRecord.SubjectProfile {
  switch (parentProfile) {
    case 'target': return actionType === 'get' ? 'target' : 'output'
    case 'input': return 'input'
    case 'output': return 'output'
  }
}
