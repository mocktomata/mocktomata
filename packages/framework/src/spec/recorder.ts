import { logLevels } from 'standard-log';
import { tersify } from 'tersify';
import { JSONTypes, PartialPick, required } from 'type-plus';
import { notDefined } from '../constants';
import { log } from '../log';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { findPlugin } from './findPlugin';
import { logAction, logCreateSpy, logGetAction, logRecordingTimeout, logReturnAction, logThrowsAction, logActionSetMeta } from './logs';
import { createSpecRecordBuilder, SpecRecorderBuilder } from './record';
import { getDefaultPerformer } from './subjectProfile';
import { SpecOptions, SpecPlugin, SpecRecord } from './types';

export namespace Recorder {
  export type Context<S = State> = {
    timeTracker: TimeTracker,
    record: SpecRecorderBuilder,
    state: S
  }

  export type State = {
    ref: SpecRecord.Reference,
    refId: SpecRecord.ReferenceId,
    spyOptions: Array<{ subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options }>,
  }

  export type ActionState = State & {
    actionId: SpecRecord.ActionId,
    site?: SpecRecord.SupportedKeyTypes[]
  }
}

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

function createSpy<S>(context: PartialPick<Recorder.Context<Recorder.ActionState>, 'state'>, subject: S, options: SpecPlugin.getSpy.Options) {
  const plugin = findPlugin(subject)
  // this is a valid case because there will be new feature in JavaScript that existing plugin will not support
  // istanbul ignore next
  if (!plugin) return undefined

  // `context.state` can only be undefined at `createRecorder()`. At that time `options.profile` is default to `target`
  // so `context.state` will always be defined in this line.
  const profile = options.profile || context.state!.ref.profile

  // Possible sources:
  // spec subject: undefined
  // getProperty on object/function/class/instance.promise: { ref: getId, site: [propertyName] }
  // getProperty on complex plugin: { ref: getId, site: [...propPath] }
  // invoke argument: { ref: invokeId, site: [argIndex] }
  // invoke return: { ref: returnId }
  // invoke throw: { ref: throwId }
  // instantiate argument: { ref: instantiateId, site: [argIndex] }
  const source = context.state ? { ref: context.state.actionId, site: options.site } : undefined
  const ref: SpecRecord.Reference = { plugin: plugin.name, profile, subject, testDouble: notDefined, source }
  const refId = context.record.addRef(ref)
  const state = { ref, refId, spyOptions: [] }
  logCreateSpy(state, profile, subject)
  ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state }), subject)
  // TODO: fix circular reference
  return ref.testDouble
}

function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext {
  return {
    setSpyOptions: (subject, options) => setSpyOptions(context, subject, options),
    setMeta: meta => setMeta(context, meta),
    getProperty: (options, handler) => getProperty(context, options, handler),
    invoke: (handler, options = {}) => invoke(context, handler, options),
    instantiate: (args, instanceOptions = {}) => instanceRecorder(context, args, instanceOptions)
  }
}

function getProperty<V>(
  context: Recorder.Context,
  { site, performer, meta }: SpecPlugin.SpyContext.getProperty.Options,
  handler: SpecPlugin.SpyContext.getProperty.Handler<V>
): V {
  const { record, timeTracker, state } = context
  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.GetAction = {
    type: 'get',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    site,
    meta
  }
  const actionId = record.addAction(action)

  const newContext = {
    ...context,
    state: { ...context.state, actionId, site }
  }
  logGetAction(newContext.state, performer)

  try {
    const result = handler()
    const spy = getSpy(newContext, result, {})
    const refId = record.findRefId(spy)
    const returnAction: SpecRecord.ReturnAction = {
      type: 'return',
      actionId,
      tick: timeTracker.elaspe(),
      payload: refId !== undefined ? refId : result,
    }
    const returnActionId = record.addAction(returnAction)
    logReturnAction(newContext.state, returnActionId, returnAction.payload)
    return spy
  }
  catch (e) {
    const spy = getSpy(newContext, e, {})
    const refId = record.findRefId(spy)
    const throwAction: SpecRecord.ThrowAction = {
      type: 'throw',
      actionId,
      tick: timeTracker.elaspe(),
      payload: refId !== undefined ? refId : e,
    }
    const throwActionId = record.addAction(throwAction)
    logThrowsAction(newContext.state, throwActionId, throwAction.payload)
    return spy
  }
}

function setSpyOptions(context: Recorder.Context, subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options) {
  context.state.spyOptions.push({ subject, options })
}

function setMeta<M extends JSONTypes>({ state }: Recorder.Context, meta: M) {
  const ref = state.ref
  state.ref.meta = meta
  log.on(logLevels.trace, () => `${ref.plugin} <ref:${state.refId}> set meta: ${tersify(meta)}`)
  return meta
}

export function getSpy<S>(context: Recorder.Context<Recorder.ActionState>, subject: S, options: SpecPlugin.getSpy.Options) {
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



function invoke<V>(context: Recorder.Context, handler: SpecPlugin.invoke.Handler<V>, options: SpecPlugin.invoke.Options) {
  const { record, timeTracker, state } = context

  const performer = options.performer || getDefaultPerformer(state.ref.profile)
  const payload: any[] = []
  const subjects: any[] = []
  const action: SpecRecord.InvokeAction = { type: 'invoke', ref: state.refId, tick: timeTracker.elaspe(), payload, performer }
  const actionId = record.addAction(action)

  const newContext = {
    ...context,
    state: { ...context.state, actionId }
  }

  const result = handler({
    withArgs: args => args.map(arg => {
      const ref = record.findRef(arg)
      if (ref) {
        payload.push(record.getRefId(ref))
        subjects.push(ref.subject)
      }
      else {
        payload.push(arg)
        subjects.push(arg)
      }
      return arg
    }) as typeof args,
    // TODO: support scope
    withThisArg: arg => arg,
  })

  logAction(newContext.state, actionId, { ...action, payload: subjects })

  return result
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

function instanceRecorder(context: Recorder.Context, args: any[], options: SpecPlugin.InstantiateOptions) {
  return {} as any
}
