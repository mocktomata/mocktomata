import { logLevels } from 'standard-log';
import { tersify } from 'tersify';
import { PartialPick, required } from 'type-plus';
import { notDefined } from '../constants';
import { log } from '../log';
import { createTimeTracker } from './createTimeTracker';
import { findPlugin, getPlugin } from './findPlugin';
import { logAction, logCreateSpy, logRecordingTimeout } from './logs';
import { createSpecRecordBuilder } from './record';
import { getDefaultPerformer } from './subjectProfile';
import { Meta, SpecOptions, SpecPlugin, SpecRecord } from './types';
import { Recorder } from './types-internal';

export function createRecorder(specName: string, options: SpecOptions) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const record = createSpecRecordBuilder(specName)
  const context = { record, timeTracker }

  return {
    createSpy: <S>(subject: S) => createSpy(context, subject, { profile: 'target' }),
    end: () => timeTracker.stop(),
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createSpy<S>(context: PartialPick<Recorder.Context, 'state'>, subject: S, options: { profile: SpecRecord.SubjectProfile }) {
  const plugin = findPlugin(subject)
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
  const ref: SpecRecord.Reference = { plugin: plugin.name, profile, subject, testDouble: notDefined, source }
  const refId = context.record.addRef(ref)
  const state: Recorder.State = { ref, refId, spyOptions: [], source }
  logCreateSpy(state, profile, subject)
  ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state: { ...state, source: undefined } }), subject)
  // TODO: fix circular reference
  return ref.testDouble
}

export function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext {
  return {
    setSpyOptions: (subject, options) => setSpyOptions(context, subject, options),
    setMeta: meta => setMeta(context, meta),
    getSpyId: value => getSpyId(context, value),
    getProperty: (options, handler) => getProperty(context, options, handler),
    setProperty: (options, handler) => setProperty(context, options, handler),
    invoke: (options, handler) => invoke(context, options, handler),
    instantiate: (options, handler) => instantiate(context, options, handler)
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

function setMeta<M extends Meta>({ state }: Recorder.Context, meta: M) {
  const ref = state.ref
  state.ref.meta = meta
  log.on(logLevels.trace, () => `${ref.plugin} <ref:${state.refId}> set meta: ${tersify(meta)}`)
  return meta
}

export function getSpy<S>(context: Recorder.Context, subject: S, options: { source?: SpecRecord.ReferenceSource, profile?: SpecRecord.SubjectProfile }): S {
  const { record, state } = context
  const ref = record.findRef(subject)
  if (ref) {
    if (ref.testDouble === notDefined) {
      // console.log('getspy ref', ref)
      // console.log('getspy state.ref', state.ref)
      // console.log('getspy options', options)
      const plugin = getPlugin(ref.plugin)
      ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state: { ...state, source: undefined } }), ref.subject)
      // ref.testDouble = createSpy({ ...context, state: required(state, { source: options.source ?? state.source }) }, subject, { profile }) || subject
      //   const subjectId = record.getRefId(reference)
      //   state.circularRefs.push({ sourceId: state.id, sourceSite: options.site || [], subjectId })
    }
    return ref.testDouble
  }
  const sourceRef = state.ref
  const profile = options.profile || sourceRef.profile

  // console.log('beofre create spy from getspy')
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

  const spiedThisArg = getSpy({ ...context, state: { ...context.state, source: { type: 'this', id: actionId } } }, thisArg, {
    // TODO: if performer is overridden, this might change
    profile: getProfileForInvokeThis(state.ref.profile),
    source: { type: 'this', id: actionId }
  })
  action.thisArg = record.findRefId(spiedThisArg) || thisArg

  const spiedArgs = args.map((arg, i) => {
    const spiedArg = getSpy({ ...context, state: { ...context.state, source: { type: 'argument', id: actionId, key: i } } }, arg, {
      profile: getProfileForInvokeArgument(state.ref.profile),
      source: { type: 'argument', id: actionId, key: i }
    })
    action.payload.push(record.findRefId(spiedArg) || arg)
    return spiedArg
  })

  logAction(context.state, actionId, action)

  return handleResult({ ...context, state: { ...context.state, source: { type: 'result', id: actionId } } }, actionId, action.type, () => handler({
    // TODO: support scope
    thisArg: action.thisArg,
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
): SpecPlugin.SpyContext.instantiate.Recorder {
  const { record, state, timeTracker } = context
  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.InstantiateAction = {
    type: 'instantiate',
    refId: state.refId,
    instanceId: '', // to be filled in by `setInstance()`
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
  handler({ args: spiedArgs })

  let newContext: Recorder.Context
  return {
    setInstance(instance) {
      const spiedInstance = handleResult({ ...context, state: { ...context.state, source: { type: 'result', id: actionId } } }, actionId, action.type, () => instance)
      const ref = record.findRef(spiedInstance)!
      const refId = record.getRefId(ref)
      action.instanceId = refId
      newContext = {
        ...context,
        state: {
          ...context.state,
          ref,
          refId
        }
      }
    },
    invoke: (options, handler) => invoke(newContext, options, handler)
  }
}