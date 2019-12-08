import { logLevels } from 'standard-log';
import { tersify } from 'tersify';
import { PartialPick, required } from 'type-plus';
import { notDefined } from '../constants';
import { log } from '../log';
import { createTimeTracker } from './createTimeTracker';
import { findPlugin } from './findPlugin';
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

function createSpy<S>(context: PartialPick<Recorder.Context<Recorder.CauseActionsState>, 'state'>, subject: S, options: SpecPlugin.getSpy.Options) {
  const plugin = findPlugin(subject)
  // this is a valid case because there will be new feature in JavaScript that existing plugin will not support
  // istanbul ignore next
  if (!plugin) return undefined

  // `context.state` can only be undefined at `createRecorder()`. At that time `options.profile` is default to `target`
  // so `context.state` will always be defined in this line.
  const profile = options.profile || context.state!.ref.profile

  const site = options.site || context.state?.site
  // Possible sources:
  // spec subject: undefined
  // getProperty on object/function/class/instance.promise: { actionId: getId, site: [propertyName] }
  // getProperty on complex plugin: { actionId: getId, site: [...propPath] }
  // invoke argument: { actionId: invokeId, site: [argIndex] }
  // invoke return: { actionId: returnId }
  // invoke throw: { actionId: throwId }
  // instantiate argument: { actionId: instantiateId, site: [argIndex] }
  const source = context.state ? { actionId: context.state.actionId, site } : undefined
  const ref: SpecRecord.Reference = { plugin: plugin.name, profile, subject, testDouble: notDefined, source }
  const refId = context.record.addRef(ref)
  const state = { ref, refId, spyOptions: [] }
  logCreateSpy(state, profile, subject)
  ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state }), subject)
  // TODO: fix circular reference
  return ref.testDouble
}

export function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext {
  return {
    setSpyOptions: (subject, options) => setSpyOptions(context, subject, options),
    setMeta: meta => setMeta(context, meta),
    getProperty: (options, handler) => getProperty(context, options, handler),
    invoke: (options, handler) => invoke(context, options, handler),
    instantiate: (options, handler) => instantiate(context, options, handler)
  }
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

  const getActionContext = {
    ...context,
    state: { ...context.state, actionId, site: { type: 'property' as const, key } }
  }
  logAction(getActionContext.state, actionId, action)

  return handleResult(getActionContext, actionId, action.type, handler)
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

export function getSpy<S>(context: Recorder.Context<Recorder.CauseActionsState>, subject: S, options: { site: SpecRecord.Site, profile?: SpecRecord.SubjectProfile }) {
  const { record, state } = context
  const ref = record.findRef(subject)
  if (ref) {
    // if (reference.testDouble === notDefined) {
    //   const subjectId = record.getRefId(reference)
    //   state.circularRefs.push({ sourceId: state.id, sourceSite: options.site || [], subjectId })
    // }
    return ref.testDouble
  }
  const sourceRef = state.ref
  const profile = options.profile || sourceRef.profile
  const site = options.site || state.site

  // console.log('beofre create spy from getspy')
  return createSpy({ ...context, state: required(state, { site }) }, subject, { profile }) || subject
}

function invoke<V, T, A extends any[]>(
  context: Recorder.Context,
  { thisArg, args, performer }: SpecPlugin.SpyContext.invoke.Options<T, A>,
  handler: SpecPlugin.SpyContext.invoke.Handler<V, T, A>) {
  const { record, timeTracker, state } = context

  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.InvokeAction = {
    type: 'invoke',
    refId: state.refId,
    performer,
    thisArg: notDefined,
    payload: [],
    tick: timeTracker.elaspe(),
  }
  const actionId = record.addAction(action)

  const newContext = {
    ...context,
    state: { ...context.state, actionId }
  }

  const spiedThisArg = getSpy(newContext, thisArg, {
    // TODO: if performer is overridden, this might change
    profile: getProfileForInvokeThis(state.ref.profile),
    site: { type: 'this' }
  })
  action.thisArg = record.findRefId(spiedThisArg) || thisArg

  const spiedArgs = args.map((arg, i) => {
    const spiedArg = getSpy(newContext, arg, {
      profile: getProfileForInvokeArgument(state.ref.profile),
      site: { type: 'property', key: i }
    })
    action.payload.push(record.findRefId(spiedArg) || arg)
    return spiedArg
  })

  logAction(newContext.state, actionId, action)

  return handleResult(newContext, actionId, action.type, () => handler({
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
  context: Recorder.Context<Recorder.CauseActionsState>,
  actionId: SpecRecord.ActionId,
  actionType: SpecRecord.CauseActions['type'],
  handler: () => any) {
  const { record, timeTracker } = context

  try {
    const result = handler()
    const spy = getSpy(context, result, {
      profile: getProfileForInvokeResult(context.state.ref.profile, actionType),
      site: { type: 'result' }
    })
    const refId = record.findRefId(spy)
    const returnAction: SpecRecord.ReturnAction = {
      type: 'return',
      actionId,
      tick: timeTracker.elaspe(),
      payload: refId !== undefined ? refId : result,
    }
    const returnActionId = record.addAction(returnAction)
    logAction(context.state, returnActionId, returnAction)
    return spy
  }
  catch (e) {
    const spy = getSpy(context, e, { site: { type: 'result' } })
    const refId = record.findRefId(spy)
    const throwAction: SpecRecord.ThrowAction = {
      type: 'throw',
      actionId,
      tick: timeTracker.elaspe(),
      payload: refId !== undefined ? refId : e,
    }
    const throwActionId = record.addAction(throwAction)
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
// function getPropertyOld<P>(context: Recorder.Context, property: SpecRecord.SupportedKeyTypes, value: P, _options: SpecPlugin.GetPropertyOptions) {
//   const { record, state, timeTracker } = context
//   const ref = record.findRef(value)
//   let result = value
//   let subject = value
//   const payload: P | SpecRecord.ReferenceId = value
//   const site = [property]

//   const action: GetAction = { type: 'get', ref: state.actionId, payload, site, tick: timeTracker.elaspe() }
//   const actionId = record.addAction(action)
//   if (ref) {
//     subject = ref.subject
//     if (!ref.source) {
//       ref.source = { ref: actionId, site }
//     }
//     result = ref.testDouble
//     action.payload = record.getRefId(ref)
//   }

//   logAction(state, actionId, { ...action, payload: subject })

//   return result
// }

// function invocationRecorder(context: Recorder.Context, args: any[], { mode, site }: SpecPlugin.InvokeOptions) {
//   const { record, state, timeTracker } = context

//   const payload: any[] = []
//   const subjects: any[] = []

//   args.forEach(arg => {
//     const ref = record.findRef(arg)
//     if (ref) {
//       payload.push(record.getRefId(ref))
//       subjects.push(ref.subject)
//     }
//     else {
//       payload.push(arg)
//       subjects.push(arg)
//     }
//   })
//   const ref = record.getRef(state.actionId)!
//   const action: InvokeAction = {
//     type: 'invoke',
//     ref: state.actionId as SpecRecord.ReferenceId,
//     payload,
//     site,
//     mode: mode || (ref.mode === 'instantiate' ? 'passive' : ref.mode),
//     tick: timeTracker.elaspe()
//   }
//   const invokeId = record.addAction(action)
//   logAction(state, invokeId, { ...action, payload: subjects })

//   return {
//     returns: (value: any, options?: SpecPlugin.InvokeOptions) => processInvokeResult(context, 'return', invokeId, value, options),
//     throws: (err: any, options?: SpecPlugin.SpyResultOptions) => processInvokeResult(context, 'throw', invokeId, err, options)
//   }
// }

// function processInvokeResult(
//   context: Recorder.Context,
//   type: 'return' | 'throw',
//   invokeId: SpecRecord.ActionId,
//   value: any,
//   { meta }: SpecPlugin.SpyResultOptions = {}
// ) {
//   // if the value is MocktomataError,
//   // it is generated internally thus short circuit the process
//   if (value instanceof MocktomataError) return value

//   const { record, state, timeTracker } = context

//   const ref = record.findRef(value)

//   const action: ReturnAction | ThrowAction = {
//     type,
//     ref: invokeId,
//     payload: ref ? record.getRefId(ref) : value,
//     meta,
//     tick: timeTracker.elaspe()
//   }
//   const returnId = record.addAction(action)

//   const subject = ref ? ref.subject : value
//   logAction(state, returnId, { ...action, payload: subject })
//   return value
// }

function instantiate(
  context: Recorder.Context,
  options: SpecPlugin.SpyContext.instantiate.Options | undefined,
  handler: SpecPlugin.SpyContext.instantiate.Handler<any>) {
  return {} as any
}
