import { satisfies } from 'satisfier';
import { PartialPick, pick } from 'type-plus';
import { notDefined } from '../constants';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ActionMismatch, ActionTypeMismatch, ExtraAction, ExtraReference, NoSupportedPlugin, PluginNotFound, ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { logAction, logCreateStub, logRecordingTimeout, logGetAction, logReturnAction } from './logs';
import { assertActionType, createSpecRecordValidator, SpecRecordValidator } from './record';
import { Recorder } from './recorder';
import { getDefaultPerformer } from './subjectProfile';
import { SpecOptions, SpecPlugin, SpecRecord } from './types';
import { referenceMismatch, siteMismatch } from './validations';

export namespace Simulator {
  export type Context<S = Recorder.State> = {
    timeTracker: TimeTracker,
    record: SpecRecordValidator,
    state: S
  }
}

export function createSimulator(specName: string, loaded: SpecRecord, options: SpecOptions) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const record = createSpecRecordValidator(specName, loaded)
  const context = { record, timeTracker }

  return {
    createStub: <S>(subject: S) => createStub2(context, subject, { profile: 'target' }),
    end: () => timeTracker.stop(),
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createStub2<S>(context: PartialPick<Simulator.Context<Recorder.ActionState>, 'state'>, subject: S, options: SpecPlugin.getSpy.Options): S {
  const { record } = context

  // const plugin = subject === notDefined ? getPlugin(expected.plugin) : findPlugin(subject)
  const plugin = findPlugin(subject)

  // this is a valid case when user change their implementation to use some new features in JavaScript which existing plugins do not support.
  // istanbul ignore next
  if (!plugin) throw new NoSupportedPlugin(subject)

  const ref = record.findRef(subject)

  if (!ref) {
    // TODO spy on extra target if the profile is `target` or `input`
    // the code is using something new compare to what was recorded.
    // maybe we can spy on those and collect the actions,
    // as long as at the end they still produce the same result.
    // we may emit a warning at `spec.done()`
    // For now, throw an error.
    throw new ExtraReference(record.specName, subject)
  }

  if (ref.testDouble === notDefined) {
    // `context.state` can only be undefined at `createSimulator()`. At that time `options.profile` is default to `target`
    // so `context.state` will always be defined in this line.
    const profile = options.profile || context.state!.ref.profile

    const source = context.state ? { actionId: context.state.actionId, site: options.site } : undefined

    referenceMismatch({ plugin: plugin.name, profile, source }, ref)
    const refId = record.getRefId(ref)
    const state = { ref, refId, spyOptions: [] }
    logCreateStub(state, profile, subject || ref.meta)

    // const circularRefs: CircularReference[] = []
    ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, ref.meta)
    // fixCircularReferences(record, refId, circularRefs)
  }

  return ref.testDouble
}


function createStub<S>(context: PartialPick<Simulator.Context<Recorder.ActionState>, 'state'>, subject: S | typeof notDefined, options: SpecPlugin.getSpy.Options) {
  const { record } = context

  const expected = record.getNextExpectedRef()
  if (!expected) throw new ExtraReference(record.specName, subject)

  const plugin = subject === notDefined ? getPlugin(expected.plugin) : findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }

  const profile = options.profile || context.state!.ref.profile

  const source = context.state ? { actionId: context.state.actionId, site: options.site } : undefined
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
    getProperty: (options) => getProperty(context, options),
    invoke: (options, handler) => invoke(context, options, handler),
    resolve: (refIdOrValue, options = {}) => resolve(context, refIdOrValue, options),
    instantiate: (args, instanceOptions = {}) => instanceRecorder(context, args, instanceOptions)
  }
}

function getProperty(
  context: Simulator.Context,
  { site, performer }: SpecPlugin.StubContext.getProperty.Options
) {
  const { record, timeTracker, state } = context
  performer = performer || getDefaultPerformer(state.ref.profile)

  // getProperty calls may be caused by framework access.
  // Those calls will not be record and simply ignored.
  // The one I have indentified is `then` check,
  // probably by TypeScript or async/await for checking if the object is a promise
  if (site === 'then' &&
    state.ref.plugin !== '@mocktomata/es2015/promise' &&
    !record.hasExpectedGetThenAction(state.refId)
  ) return undefined

  const action: SpecRecord.GetAction = {
    type: 'get',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    site,
  }
  const actionId = record.addAction(action)
  const newState = { ...state, actionId, site }
  logGetAction(newState, performer)
  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  if (typeof resultAction.payload === 'string') {
    const ref = record.findRef(resultAction.payload)!
    if (ref.testDouble === notDefined) {
      buildTestDouble(context, ref)
    }

    logReturnAction(newState, resultActionId, ref.subject !== notDefined ? ref.subject : ref.meta)
    return ref.testDouble
  }

  logReturnAction(newState, resultActionId, resultAction.payload)
  return resultAction.payload
}

function buildTestDouble(context: Simulator.COntext, ref: SpecRecord.Reference) {

}

function resolve(context: Simulator.Context, refIdOrValue: any, options: SpecPlugin.ResolveOptions) {
  return undefined as any
}

function invoke(context: Simulator.Context,
  options: SpecPlugin.StubContext.invoke.Options | undefined,
  handler: SpecPlugin.StubContext.invoke.Handler<any> | undefined
) {
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
    refId: state.refId,
    performer: options.performer || getDefaultPerformer(state.ref.profile),
    payload,
    site,
    tick: timeTracker.elaspe()
  }
  const actionId = record.getNextActionId()
  if (!expected) {
    throw new ExtraAction(record.specName, state, actionId, { ...action, payload: subjects })
  }

  if (!satisfies(expected, pick(action, 'type', 'refId', 'payload', 'performer'))) {
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
        refId: actionId,
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
    valeu: createStub({ ...context, state: { ...context.state, site: [] } }, expectedReference, notDefined, {}),
    meta: expected.meta
  }
}


function processNextAction(context: Simulator.Context) {
  const { record } = context
  const nextAction = record.getNextExpectedAction()
  if (!nextAction) return
  switch (nextAction.type) {
    case 'get':
      processGet(context, nextAction)
      break
    case 'invoke':
      if (nextAction.performer !== 'mockto') return
      processInvoke()
      break
    case 'instantiate':
      if (nextAction.performer !== 'mockto') return
      processInstantiate()
  }
  function processInvoke() { }
  function processInstantiate() { }
}

function processGet(context: Simulator.Context, nextAction: SpecRecord.GetAction) {
  const { record } = context
  if (nextAction.performer !== 'mockto') return
  const ref = record.getRef(nextAction.refId)
  ref?.testDouble[nextAction.site]
}
