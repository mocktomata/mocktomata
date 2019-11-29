import { satisfies } from 'satisfier';
import { PartialPick, pick } from 'type-plus';
import { notDefined } from '../constants';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ActionMismatch, ActionTypeMismatch, ExtraAction, ExtraReference, PluginNotFound, ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { logAction, logCreateStub, logRecordingTimeout } from './logs';
import { assertActionType, createValidatingRecord, ValidatingRecord, createRecord } from './record';
import { Recorder } from './recorder';
import { getDefaultPerformer } from './subjectProfile';
import { SpecOptions, SpecPlugin, SpecRecord } from './types';
import { referenceMismatch, siteMismatch } from './validations';

export namespace Simulator {
  export type Context<S = Recorder.State> = {
    timeTracker: TimeTracker,
    record: ValidatingRecord,
    state: S
  }
}

export function createSimulator(specName: string, loaded: SpecRecord, options: SpecOptions) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const original = createRecord(specName, loaded)

  const record = createValidatingRecord(specName, loaded)
  const context = { record, timeTracker }

  return {
    createStub: <S>(subject: S) => createStub(context, subject, { profile: 'target' }),
    end: () => timeTracker.stop(),
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createStub<S>(context: PartialPick<Simulator.Context<Recorder.ActionState>, 'state'>, subject: S, options: SpecPlugin.getSpy.Options) {
  const { record } = context
  const expected = record.getNextExpectedRef()
  if (!expected) throw new ExtraReference(record.specName, subject)

  return createStubInternal(context, expected, subject, options)
}

function createStubInternal(context: PartialPick<Simulator.Context<Recorder.ActionState>, 'state'>, expected: SpecRecord.Reference, subject: any, options: SpecPlugin.getSpy.Options) {
  const { record } = context

  const plugin = subject === notDefined ? getPlugin(expected.plugin) : findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }

  const profile = options.profile || context.state!.ref.profile

  const source = context.state ? { ref: context.state.actionId, site: options.site } : undefined
  const ref: SpecRecord.Reference = { plugin: plugin.name, profile, subject, testDouble: notDefined, source }

  if (referenceMismatch(ref, expected)) throw new ReferenceMismatch(record.specName, ref, expected)

  const refId = context.record.addRef(ref)
  const state = { ref, refId, spyOptions: [] }
  logCreateStub(state, profile, expected.meta)
  // const circularRefs: CircularReference[] = []
  ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, expected.meta)
  // fixCircularReferences(record, refId, circularRefs)
  return ref.testDouble
}

function createPluginStubContext(context: Simulator.Context): SpecPlugin.StubContext {
  return {
    getProperty: (site) => getProperty(context, site),
    invoke: (args, invokeOptions = {}) => invocationResponder(context, args, invokeOptions),
    resolve: (refIdOrValue, options = {}) => resolve(context, refIdOrValue, options),
    instantiate: (args, instanceOptions = {}) => instanceRecorder(context, args, instanceOptions)
  }
}

function getProperty(context: Simulator.Context, site: SpecRecord.SupportedKeyTypes[]) {
  const { record, timeTracker } = context
  const expected = record.getNextExpectedAction()
  // getProperty calls may be caused by framework access.
  // Those calls will not be record and simply ignored.
  // The one I have indentified is `then` check,
  // probably by TypeScript or async/await for checking if the object is a promise
  if (site.length === 1 && site[0] === 'then' && notGetThenAction(expected)) return undefined
  const performer = getDefaultPerformer(context.state.ref.profile)
  const action: SpecRecord.GetAction = { type: 'get', ref: context.state.refId, performer, tick: timeTracker.elaspe(), payload: undefined, site }
  const actionId = record.getNextActionId()
  const state = { ...context.state, actionId }
  if (!expected) throw new ExtraAction(record.specName, state, actionId, action)

  if (!satisfies(expected, pick(action, 'type', 'ref', 'site'))) {
    throw new ActionMismatch(record.specName, action, expected)
  }

  action.payload = expected.payload
  const refOrValue = expected.payload
  let subject = refOrValue
  let result = refOrValue
  if (typeof refOrValue === 'string') {
    const reference = record.getRef(refOrValue)
    if (reference) {
      return undefined
    }
    else {
      // using `!` because ref is from saved record, so the original reference must exists.
      const origRef = record.getExpectedRef(refOrValue)!
      if (!origRef.source ||
        origRef.source.ref !== state.refId ||
        siteMismatch(site, origRef.source.site)
      ) {
        // why not throwing?
        return undefined
      }

      const sourceRef = record.getRef(origRef.source.ref)!
      subject = getByPath(sourceRef.subject, origRef.source.site || [])
      result = createStubInternal({ ...context, state: { ...state, site } }, origRef, subject, {})
    }
  }


  record.addAction(action)
  logAction(state, actionId, { ...action, payload: subject })
  return result
}

function resolve(context: Simulator.Context, refIdOrValue: any, options: SpecPlugin.ResolveOptions) {
  return undefined as any
}

function invocationResponder(context: Simulator.Context, args: any[], options: SpecPlugin.invoke.Options) {
  const { record, timeTracker, state } = context
  const expected = record.getNextExpectedAction()

  const subjects: any[] = []
  const payload: any[] = []
  args.forEach(arg => {
    const ref = record.findRef(arg)
    if (ref) {
      payload.push(record.getRefId(ref))
      subjects.push(ref.subject)
    }
    else {
      subjects.push(arg)
      payload.push(arg)
    }
  })

  const site = options.site
  const action: SpecRecord.InvokeAction = {
    type: 'invoke',
    ref: state.refId,
    performer: options.performer || getDefaultPerformer(state.ref.profile),
    payload,
    site,
    tick: timeTracker.elaspe()
  }
  const actionId = record.getNextActionId()
  if (!expected) {
    throw new ExtraAction(record.specName, state, actionId, { ...action, payload: subjects })
  }

  if (!satisfies(expected, pick(action, 'type', 'ref', 'payload', 'performer'))) {
    throw new ActionMismatch(record.specName, action, expected)
  }
  record.addAction(action)
  logAction(state, actionId, action)

  return {
    getResult: () => {
      // result action cannot be missing because JavaScript is single threaded.
      // if the function call did not return, user cannot call `await spec.done()`
      const expected = record.getNextExpectedAction()!
      return getResult(context, expected)
    },
    returns(value: any) {
      const expected = record.getNextExpectedAction()
      assertActionType<SpecRecord.ReturnAction>(record.specName, 'return', expected)
      const action: SpecRecord.ReturnAction = {
        type: 'return',
        ref: actionId,
        payload: record.findRefId(value) || value,
        tick: timeTracker.elaspe()
      }
      logAction(state, actionId, action)
      record.addAction(action)
      return value
    },
  } as any
}

function instanceRecorder(context: Simulator.Context, args: any, options: SpecPlugin.InstantiateOptions) {
  return undefined as any
}

function getByPath(subject: any, sitePath: Array<string | number>) {
  if (subject === undefined) return subject
  return sitePath.reduce((p, s) => p[s], subject)
}

function notGetThenAction(action: SpecRecord.Action | undefined) {
  return !(action && action.type === 'get' && action.site.length === 1 && action.site[0] === 'then')
}

function getResult(context: Simulator.Context<Recorder.ActionState>, expected: SpecRecord.Action) {
  const { record, state } = context
  // TODO check for action mismatch
  if (expected.type !== 'return' && expected.type !== 'throw') {
    const actionId = record.getNextActionId()
    throw new ActionTypeMismatch(record.specName, state, actionId, expected, 'return or throw')
  }
  console.log(expected)
  if (typeof expected.payload !== 'string') {
    return {
      type: expected.type,
      value: expected.payload,
      meta: expected.meta
    }
  }
  const actualReference = record.getRef(expected.payload)
  if (actualReference) {
    return {
      type: expected.type,
      value: actualReference.testDouble,
      meta: expected.meta
    }
  }

  const expectedReference = record.getExpectedRef(expected.payload)!

  console.log('state', state)
  return {
    type: expected.type,
    valeu: createStubInternal({ ...context, state: { ...context.state, site: [] } }, expectedReference, notDefined, {}),
    meta: expected.meta
  }
}
