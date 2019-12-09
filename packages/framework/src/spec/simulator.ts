import { PartialPick } from 'type-plus';
import { notDefined } from '../constants';
import { actionMatches } from './actionMatches';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ActionMismatch, ActionTypeMismatch, ExtraReference, NoSupportedPlugin } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { logAction, logCreateStub, logRecordingTimeout, logCreateSpy } from './logs';
import { createSpecRecordValidator, SpecRecordValidator, ValidateReference } from './record';
import { getDefaultPerformer } from './subjectProfile';
import { SpecOptions, SpecPlugin, SpecRecord, SpecPluginActivationContext } from './types';
import { Recorder } from './types-internal';
import { referenceMismatch } from './validations';
import { createPluginSpyContext } from './recorder';

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
    createStub: <S>(subject: S) => createStub(context, subject, { profile: 'target' }),
    end: () => timeTracker.stop(),
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createStub<S>(context: PartialPick<Simulator.Context<Recorder.CauseActionsState>, 'state'>, subject: S, options: SpecPlugin.getSpy.Options): S {
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

function createPluginStubContext(context: Simulator.Context): SpecPlugin.StubContext {
  return {
    resolve: value => resolve(context, value),
    getProperty: options => getProperty(context, options),
    setProperty: options => setProperty(context, options),
    invoke: options => invoke(context, options),
    instantiate: options => instantiate(context, options)
  }
}

function resolve<V = any>(
  context: Simulator.Context,
  value: V
) {
  const { record } = context

  if (typeof value === 'string') {
    const ref = record.getRef(value)!
    if (ref.testDouble === notDefined) {
      buildTestDouble(context, ref)
    }

    return ref.testDouble
  }
  return value
}

function getProperty(
  context: Simulator.Context,
  { key, performer }: SpecPlugin.StubContext.getProperty.Options
) {
  const { record, timeTracker, state } = context
  performer = performer || getDefaultPerformer(state.ref.profile)

  const expected = record.getNextExpectedAction()

  const action: SpecRecord.GetAction = {
    type: 'get',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    key,
  }

  if (!actionMatches(action, expected)) {
    // getProperty calls may be caused by framework access.
    // Those calls will not be record and simply ignored.

    // The one I have indentified is `then` check,
    // probably by TypeScript or async/await for checking if the object is a promise
    if (typeof key === 'symbol' || (key === 'then' &&
      state.ref.plugin !== '@mocktomata/es2015/promise' &&
      !record.hasExpectedGetThenAction(state.refId)
    )) return undefined

    if (!expected) {
      return undefined
    }
    throw new ActionMismatch(record.specName, action, expected)
  }

  const site: SpecRecord.PropertySite = { type: 'property', key }
  const actionId = record.addAction(action)
  const newState = { ...state, actionId, site }

  logAction(newState, actionId, action)
  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  let result = resultAction.payload
  if (typeof resultAction.payload === 'string') {
    const ref = record.getRef(resultAction.payload)!
    if (ref.testDouble === notDefined) {
      buildTestDouble(context, ref)
    }

    result = ref.testDouble
  }

  if (resultAction.type === 'return') {
    logAction(newState, resultActionId, resultAction)
    return result
  }
  else {
    logAction(newState, resultActionId, resultAction)
    throw result
  }
}

function setProperty<V = any>(
  context: Simulator.Context,
  { key, value, performer }: SpecPlugin.StubContext.setProperty.Options<V>
) {
  // value can be:
  //   `user`: actual value or spy/stub if user uses a value returned to him.
  //   `mockto`: spy/stub (`mockto` should not perform on stub under basic usage)
  //   `plugin`: actual value or spy/stub, just like `user`
  const { record, timeTracker, state } = context
  const expected = record.getNextExpectedAction()

  performer = performer || getDefaultPerformer(state.ref.profile)
  const action: SpecRecord.SetAction = {
    type: 'set',
    refId: state.refId,
    performer,
    tick: timeTracker.elaspe(),
    key,
    value: notDefined
  }

  if (!actionMatches(action, expected)) {
    throw new ActionMismatch(record.specName, action, expected)
  }

  const actionId = record.addAction(action)
  const newState = { ...state, actionId }

  const valueRef = record.findRef(value)
  if (valueRef) {
    if (valueRef.testDouble === notDefined) {
      buildTestDouble(context, valueRef)
    }
    action.value = record.getRefId(valueRef)
  }
  else {
    action.value = value
  }
  logAction(newState, actionId, action)
  processNextAction(context)
  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  let result = resultAction.payload
  if (typeof resultAction.payload === 'string') {
    const ref = record.getRef(resultAction.payload)!
    if (ref.testDouble === notDefined) {
      buildTestDouble(context, ref)
    }

    result = ref.testDouble
  }

  if (resultAction.type === 'return') {
    logAction(newState, resultActionId, resultAction)
    return result
  }
  else {
    logAction(newState, resultActionId, resultAction)
    throw result
  }
}
function buildTestDouble(context: Simulator.Context, ref: ValidateReference) {
  const { record } = context
  const plugin = getPlugin(ref.plugin)
  const profile = ref.profile
  const subject = ref.subject
  const refId = record.getRefId(ref)
  const state = { ref, refId, spyOptions: [] }
  if (profile === 'input') {
    logCreateSpy(state, profile, subject)
    ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state }), subject)
  }
  else {
    logCreateStub(state, profile, subject !== notDefined ? subject : ref.meta)
    // const circularRefs: CircularReference[] = []
    ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, ref.meta)
    // fixCircularReferences(record, refId, circularRefs)
  }
  ref.claimed = true
}

function invoke(context: Simulator.Context,
  { thisArg, args, performer }: SpecPlugin.StubContext.invoke.Options,
) {
  const { record, timeTracker, state } = context

  const { ref } = state
  const expected = record.getNextExpectedAction()

  performer = performer || getDefaultPerformer(ref.profile)
  const action: SpecRecord.InvokeAction = {
    type: 'invoke',
    refId: state.refId,
    performer,
    thisArg: notDefined,
    payload: [],
    tick: timeTracker.elaspe(),
  }
  if (!actionMatches(action, expected)) {
    throw new ActionMismatch(record.specName, action, expected)
  }

  const actionId = record.addAction(action)
  const newState = { ...state, actionId }

  const thisArgRef = record.findRef(thisArg)
  if (!thisArgRef) {
    throw new ExtraReference(record.specName, thisArg)
  }
  if (thisArgRef.testDouble === notDefined) {
    buildTestDouble(context, thisArgRef)
  }
  action.thisArg = record.getRefId(thisArgRef)

  args.map(arg => {
    const ref = record.findRef(arg)
    if (ref) {
      if (ref.testDouble === notDefined) {
        buildTestDouble(context, ref)
      }
      action.payload.push(record.getRefId(ref))
    }
    else {
      action.payload.push(arg)
    }
    return arg
  })
  logAction(newState, actionId, action)
  // if (state.ref.profile === 'input') {
  //   console.log('called??')
  //   // TODO: need to process next action?
  //   return newState.ref.testDouble.apply(thisArg, spiedArgs)
  // }

  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  let result = resultAction.payload
  if (typeof resultAction.payload === 'string') {
    const ref = record.getRef(resultAction.payload)!
    if (ref.testDouble === notDefined) {
      buildTestDouble(context, ref)
    }

    result = ref.testDouble
  }

  if (resultAction.type === 'return') {
    logAction(newState, resultActionId, resultAction)
    return result
  }
  else {
    logAction(newState, resultActionId, resultAction)
    throw result
  }
}

function instantiate(context: Simulator.Context, options: SpecPlugin.StubContext.instantiate.Options) {
  return undefined as any
}

function getByPath(subject: any, sitePath: Array<string | number>) {
  if (subject === undefined) return subject
  return sitePath.reduce((p, s) => p[s], subject)
}

function notGetThenAction(action: SpecRecord.Action | undefined) {
  return !(action && action.type === 'get' && action.key.length === 1 && action.key[0] === 'then')
}

function getResult(context: Simulator.Context<Recorder.CauseActionsState>, expected: SpecRecord.Action) {
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
      processInvoke(context, nextAction)
      break
    case 'instantiate':
      if (nextAction.performer !== 'mockto') return
      processInstantiate()
  }
  function processInvoke(context: Simulator.Context, action: SpecRecord.InvokeAction) {
    const { record } = context
    if (action.performer !== 'mockto') return

    const ref = record.getRef(action.refId)
    const thisArgRef = record.getRef(action.thisArg)!
    if (thisArgRef.testDouble === notDefined) {

      buildTestDouble(context, thisArgRef)
    }
    const args = action.payload.map(arg => {
      if (typeof arg === 'string') {
        const ref = record.getRef(arg)
        if (ref?.testDouble === notDefined) {
          buildTestDouble(context, ref)
        }
        return ref?.testDouble
      }
      else {
        return arg
      }
    })
    return ref?.testDouble.apply(thisArgRef.testDouble, args)
  }
}

function processInstantiate() { }

function processGet(context: Simulator.Context, nextAction: SpecRecord.GetAction) {
  const { record } = context
  if (nextAction.performer !== 'mockto') return
  const ref = record.getRef(nextAction.refId)
  ref?.testDouble[nextAction.key]
}
