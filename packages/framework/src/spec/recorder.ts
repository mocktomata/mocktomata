import { PartialPick, required } from 'type-plus'
import { notDefined } from '../constants'
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin'
import { SpecPlugin } from '../spec-plugin/types'
import { createTimeTracker } from './createTimeTracker'
import { logAction, logCreateSpy, logRecordingTimeout } from './logs'
import { createSpecRecordBuilder } from './record'
import { getDefaultPerformer } from './subjectProfile'
import { Spec, SpecRecord } from './types'
import { Recorder, SpecRecordLive } from './types-internal'

export function createRecorder(specName: string, options: Spec.Options) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(specName, options.timeout))
  const record = createSpecRecordBuilder(specName)
  const context = { record, timeTracker }

  return {
    createSpy: <S>(subject: S) => createSpy(context, subject, { profile: 'target' }),
    end: () => timeTracker.stop(),
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createSpy<S>(context: PartialPick<Recorder.Context, 'state'>, subject: S, options: { profile: SpecRecord.SubjectProfile }) {
  const spyOption = context.state?.spyOptions.find(o => o.subject === subject)
  const plugin = spyOption?.options.plugin ? getPlugin(spyOption.options.plugin) : findPlugin(subject)
  // this is a valid case because there will be new feature in JavaScript that existing plugin will not support
  // istanbul ignore next
  if (!plugin) return undefined
  // `context.state` can only be undefined at `createRecorder()`. At that time `options.profile` is default to `target`
  // so `context.state` will always be defined in this line.
  const profile = options.profile || context.state!.ref.profile

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
  const ref: SpecRecordLive.Reference = { plugin: plugin.name, profile, states: [], subject, testDouble: notDefined, source }
  const refId = context.record.addRef(ref)
  const state = { ref, refId, spyOptions: [] }
  logCreateSpy(state, profile, subject)
  const newContext = { ...context, state }
  ref.states.push(state)
  ref.testDouble = plugin.createSpy(createPluginSpyContext(newContext), subject)
  // TODO: fix circular reference
  return ref.testDouble
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

function getSpyId<V>(context: Recorder.Context, value: V) {
  const { record } = context
  const spy = getSpy(context, value, {})
  return record.findRefId(spy) || value
}

function getProperty<V>(
  context: Recorder.Context,
  { key, performer }: SpecPlugin.SpyContext.getProperty.Options,
  handler: SpecPlugin.SpyContext.getProperty.Handler<V>
): V {
  const { record, timeTracker, state } = context
  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.GetAction = {
    type: 'get',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    key,
  }

  const actionId = record.addAction(action)

  logAction(context.state, actionId, action)

  return handleResult({ ...context, state: { ...context.state, source: { type: 'result', id: actionId } } }, actionId, action.type, handler)
}

function setProperty<V, R>(
  context: Recorder.Context,
  { key, value, performer }: SpecPlugin.SpyContext.setProperty.Options<V>,
  handler: SpecPlugin.SpyContext.setProperty.Handler<V, R>
): R {
  const { record, timeTracker, state } = context
  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.SetAction = {
    type: 'set',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    key,
    value: notDefined
  }

  const actionId = record.addAction(action)

  const spiedValue = getSpy({
    ...context,
    state: { ...context.state, source: { type: 'property', id: actionId, key } }
  }, value, {
    // TODO: if performer is overridden, this might change
    profile: getProfileForInvokeThis(state.ref.profile),
    source: { type: 'this', id: actionId }
  })
  action.value = record.findRefId(spiedValue) || value

  logAction(context.state, actionId, action)

  return handleResult(
    { ...context, state: { ...context.state, source: { type: 'result', id: actionId } } },
    actionId,
    action.type,
    () => handler(spiedValue))
}

function setSpyOptions(context: Recorder.Context, subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options) {
  context.state.spyOptions.push({ subject, options })
}

function setMeta<M extends SpecRecord.Meta>({ state }: Recorder.Context, meta: M) {
  return state.ref.meta = meta
}

export function getSpy<S>(context: Recorder.Context, subject: S, options: { source?: SpecRecord.ReferenceSource, profile?: SpecRecord.SubjectProfile }): S {
  const { record, state } = context
  const ref = record.findRef(subject)
  if (ref) {
    if (ref.testDouble === notDefined) {
      const plugin = getPlugin(ref.plugin)
      ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state: { ...state, source: undefined } }), ref.subject)
    }
    return ref.testDouble
  }
  const sourceRef = state.ref
  const profile = options.profile || sourceRef.profile

  return createSpy({ ...context, state: required(state, { source: options.source ?? state.source }) }, subject, { profile }) || subject
}

function invoke<V, T, A extends any[]>(
  context: Recorder.Context,
  { thisArg, args, performer, site }: SpecPlugin.SpyContext.invoke.Options<T, A>,
  handler: SpecPlugin.SpyContext.invoke.Handler<V, T, A>) {
  const { record, state, timeTracker } = context

  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.InvokeAction = {
    type: 'invoke',
    refId: state.refId,
    performer,
    site,
    thisArg: notDefined,
    payload: [],
    tick: timeTracker.elaspe(),
  }
  const actionId = record.addAction(action)

  const spiedThisArg = getSpy(
    { ...context, state: { ...context.state, source: { type: 'this', id: actionId } } },
    thisArg,
    {
      // TODO: if performer is overridden, this might change
      profile: getProfileForInvokeThis(state.ref.profile),
      source: { type: 'this', id: actionId }
    })
  action.thisArg = record.findRefId(spiedThisArg) || thisArg

  const spiedArgs = args.map((arg, i) => {
    const spiedArg = getSpy(
      { ...context, state: { ...context.state, source: { type: 'argument', id: actionId, key: i } } },
      arg,
      {
        profile: getProfileForInvokeArgument(state.ref.profile),
        source: { type: 'argument', id: actionId, key: i }
      })
    const refId = record.findRefId(spiedArg)
    action.payload.push(refId || arg)
    return spiedArg
  })

  logAction(context.state, actionId, action)
  return handleResult(
    { ...context, state: { ...context.state, source: { type: 'result', id: actionId } } },
    actionId,
    action.type,
    () => handler({
      thisArg: spiedThisArg,
      args: spiedArgs as A,
    }))
}

function getProfileForInvokeThis(parentProfile: SpecRecord.SubjectProfile): SpecRecord.SubjectProfile {
  switch (parentProfile) {
    case 'target': return 'input'
    case 'input': return 'output'
    case 'output': return 'input'
  }
}

function getProfileForInvokeArgument(parentProfile: SpecRecord.SubjectProfile): SpecRecord.SubjectProfile {
  switch (parentProfile) {
    case 'target': return 'input'
    case 'input': return 'output'
    case 'output': return 'input'
  }
}

function handleResult(
  context: Recorder.Context,
  actionId: SpecRecord.ActionId,
  actionType: SpecRecord.CauseActions['type'],
  handler: () => any
) {
  const { record, timeTracker } = context

  try {
    const result = handler()
    const returnAction: SpecRecord.ReturnAction = {
      type: 'return',
      actionId,
      tick: timeTracker.elaspe(),
      payload: notDefined
    }
    const returnActionId = record.addAction(returnAction)
    const spy = getSpy(context, result, {
      profile: getProfileForInvokeResult(context.state.ref.profile, actionType),
      source: { type: 'result', id: returnActionId }
    })
    const refId = record.findRefId(spy)
    returnAction.payload = refId !== undefined ? refId : result
    logAction(context.state, returnActionId, returnAction)
    return spy
  }
  catch (e) {
    const throwAction: SpecRecord.ThrowAction = {
      type: 'throw',
      actionId,
      tick: timeTracker.elaspe(),
      payload: notDefined
    }
    const throwActionId = record.addAction(throwAction)
    const spy = getSpy(context, e, { source: { type: 'result', id: throwActionId } })
    const refId = record.findRefId(spy)
    throwAction.payload = refId !== undefined ? refId : e

    logAction(context.state, throwActionId, throwAction)
    throw spy
  }
}

function getProfileForInvokeResult(
  parentProfile: SpecRecord.SubjectProfile,
  actionType: SpecRecord.CauseActions['type'],
): SpecRecord.SubjectProfile {
  switch (parentProfile) {
    case 'target': return actionType === 'get' ? 'target' : 'output'
    case 'input': return 'input'
    case 'output': return 'output'
  }
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

  const spiedArgs = args.map((arg, i) => {
    const spiedArg = getSpy({ ...context, state: { ...context.state, source: { type: 'argument', id: actionId, key: i } } }, arg, {
      profile: getProfileForInvokeArgument(state.ref.profile),
      source: { type: 'argument', id: actionId, key: i }
    })
    action.payload.push(record.findRefId(spiedArg) || arg)
    return spiedArg
  }) as A
  logAction(context.state, actionId, action)

  const newContext: Recorder.Context = {
    ...context,
    state: {
      ...context.state,
      source: {
        type: 'result',
        id: actionId
      }
    }
  }
  return handleResult(newContext, actionId, action.type, () => handler({ args: spiedArgs }))
}
