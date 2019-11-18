import { required } from 'type-plus';
import { notDefined } from '../constants';
import { MocktomataError } from '../errors';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { findPlugin } from './findPlugin';
import { logAction, logCreateSpy, logRecordingTimeout } from './logs';
import { createSpyingRecord, SpyRecord } from './record';
import { ActionId, ActionMode, GetAction, InvokeAction, ReferenceId, ReturnAction, SpecOptions, SpecPlugin, SpecRecord, SpecReference, SupportedKeyTypes, ThrowAction } from './types';

export namespace Recorder {
  export type SpyOptions = {
    mode?: ActionMode,
  }
  export type Context = {
    timeTracker: TimeTracker,
    record: SpyRecord,
    state: State
  }
  export type State = {
    plugin: string,
    id: ReferenceId | ActionId,
    site: SupportedKeyTypes[]
  }
}

export function createRecorder(specName: string, options: SpecOptions) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const record = createSpyingRecord(specName)
  const state = { id: 0, site: [], plugin: '' }
  const context = { record, timeTracker, state }
  return {
    createSpy: <S>(subject: S, options: Recorder.SpyOptions) => createSpy(context, subject, options),
    end() {
      timeTracker.stop()
    },
    getSpecRecord(): SpecRecord {
      return record.getSpecRecord()
    }
  }
}
function createSpy<S>(context: Recorder.Context, subject: S, { mode }: Recorder.SpyOptions) {
  const plugin = findPlugin(subject)
  // this is a valid case because there will be new feature in JavaScript that existing plugin will not support
  // istanbul ignore next
  if (!plugin) return undefined

  const ref: SpecReference = { plugin: plugin.name, subject, testDouble: notDefined, mode }
  const id = context.record.addRef(ref)
  const state = { ...context.state, id, plugin: plugin.name }
  logCreateSpy(state, mode, subject)
  ref.testDouble = plugin.createSpy(
    createPluginSpyContext({ ...context, state }),
    subject)
  // TODO: fix circular reference
  return ref.testDouble
}

function createPluginSpyContext(context: Recorder.Context): SpecPlugin.SpyContext {
  return {
    getSpy: (subject, getOptions = {}) => getSpy(context, subject, getOptions),
    getProperty: (property, value, options = {}) => getProperty(context, property, value, options),
    invoke: (args, invokeOptions = {}) => invocationRecorder(context, args, invokeOptions),
    instantiate: (args, instanceOptions = {}) => instanceRecorder(context, args, instanceOptions)
  }
}

export function getSpy<S>(context: Recorder.Context, subject: S, options: SpecPlugin.GetSpyOptions) {
  const { record, state } = context
  const ref = record.findRefBySubjectOrTestDouble(subject)
  if (ref) {
    // if (reference.testDouble === notDefined) {
    //   const subjectId = record.getRefId(reference)
    //   state.circularRefs.push({ sourceId: state.id, sourceSite: options.site || [], subjectId })
    // }
    return ref.testDouble
  }
  const sourceRef = record.getRef(state.id)!
  const mode = options.mode || sourceRef.mode
  const site = options.site || state.site

  // console.log('beofre create spy from getspy')
  return createSpy({ ...context, state: required(state, { site }) }, subject, { mode }) || subject
}

function getProperty<P>(context: Recorder.Context, property: SupportedKeyTypes, value: P, _options: SpecPlugin.GetPropertyOptions) {
  const { record, state, timeTracker } = context
  const ref = record.findRefBySubjectOrTestDouble(value)
  let result = value
  let subject = value
  let payload: P | ReferenceId = value
  const site = [property]
  if (ref) {
    subject = ref.subject
    if (!ref.source) {
      ref.source = { ref: state.id, site }
    }
    result = ref.testDouble
    payload = record.getRefId(ref)
  }

  const action: GetAction = { type: 'get', ref: state.id, payload, site, tick: timeTracker.elaspe() }
  const actionId = record.addAction(action)
  logAction(state, actionId, { ...action, payload: subject })

  return result
}

function invocationRecorder(context: Recorder.Context, args: any[], { mode, site }: SpecPlugin.InvokeOptions) {
  const { record, state, timeTracker } = context

  const payload: any[] = []
  const subjects: any[] = []

  args.forEach(arg => {
    const ref = record.findRefBySubjectOrTestDouble(arg)
    if (ref) {
      payload.push(record.getRefId(ref))
      subjects.push(ref.subject)
    }
    else {
      payload.push(arg)
      subjects.push(arg)
    }
  })
  const ref = record.getRef(state.id)!
  const action: InvokeAction = {
    type: 'invoke',
    ref: state.id as ReferenceId,
    payload,
    site,
    mode: mode || (ref.mode === 'instantiate' ? 'passive' : ref.mode),
    tick: timeTracker.elaspe()
  }
  const invokeId = record.addAction(action)
  logAction(state, invokeId, { ...action, payload: subjects })

  return {
    returns: (value: any, options?: SpecPlugin.InvokeOptions) => processInvokeResult(context, 'return', invokeId, value, options),
    throws: (err: any, options?: SpecPlugin.SpyResultOptions) => processInvokeResult(context, 'throw', invokeId, err, options)
  }
}

function processInvokeResult(
  context: Recorder.Context,
  type: 'return' | 'throw',
  invokeId: ActionId,
  value: any,
  { meta }: SpecPlugin.SpyResultOptions = {}
) {
  // if the value is MocktomataError,
  // it is generated internally thus short circuit the process
  if (value instanceof MocktomataError) return value

  const { record, state, timeTracker } = context

  const ref = record.findRefBySubjectOrTestDouble(value)

  const action: ReturnAction | ThrowAction = {
    type,
    ref: invokeId,
    payload: ref ? record.getRefId(ref) : value,
    meta,
    tick: timeTracker.elaspe()
  }
  const returnId = record.addAction(action)

  const subject = ref ? ref.subject : value
  logAction(state, returnId, { ...action, payload: subject })
  return value
}

function instanceRecorder(context: Recorder.Context, args: any[], options: SpecPlugin.InstantiateOptions) {
  return {} as any
}
