import { PartialPick } from 'type-plus';
import { notDefined } from '../constants';
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin';
import { SpecPlugin } from '../spec-plugin/types';
import { actionMatches } from './actionMatches';
import { createTimeTracker, TimeTracker } from './createTimeTracker';
import { ActionMismatch, ExtraAction, ExtraReference, MissingAction, NoSupportedPlugin } from './errors';
import { logAction, logCreateSpy, logCreateStub, logRecordingTimeout } from './logs';
import { createSpecRecordValidator, SpecRecordValidator, ValidateReference } from './record';
import { createPluginSpyContext } from './recorder';
import { getDefaultPerformer } from './subjectProfile';
import { Spec, SpecRecord } from './types';
import { Recorder } from './types-internal';
import { referenceMismatch } from './validations';

export namespace Simulator {
  export type Context = {
    timeTracker: TimeTracker,
    record: SpecRecordValidator,
    state: Recorder.State,
    pendingPluginActions: Array<SpecPlugin.StubContext.PluginAction & { ref: SpecRecord.Reference, refId: SpecRecord.ReferenceId }>
  }
}

export function createSimulator(specName: string, loaded: SpecRecord, options: Spec.Options) {
  const timeTracker = createTimeTracker(options, () => logRecordingTimeout(specName, options.timeout))
  const record = createSpecRecordValidator(specName, loaded)

  return {
    createStub: <S>(subject: S) => createStub({
      record,
      timeTracker,
      pendingPluginActions: []
    }, subject, { profile: 'target' }),
    end: () => {
      timeTracker.stop()
      const action = record.getNextExpectedAction()
      if (action) {
        const actionId = record.getNextActionId()
        const ref = record.getLoadedRef(actionId)!
        const refId = record.getLoadedRefId(ref)
        throw new MissingAction(record.specName, { ref, refId }, actionId, action)
      }
    },
    getSpecRecord: () => record.getSpecRecord()
  }
}

function createStub<S>(context: PartialPick<Simulator.Context, 'state'>, subject: S, options: { profile: SpecRecord.SubjectProfile }): S {
  const { record, timeTracker } = context

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
    timeTracker.stop()
    throw new ExtraReference(record.specName, subject)
  }

  if (ref.testDouble === notDefined) {
    // `context.state` can only be undefined at `createSimulator()`. At that time `options.profile` is default to `target`
    // so `context.state` will always be defined in this line.
    const profile = options.profile || context.state!.ref.profile

    const source = context.state?.source

    referenceMismatch({ plugin: plugin.name, profile, source }, ref)
    const refId = record.getRefId(ref)
    const state = { ref, refId, spyOptions: [] }
    logCreateStub(state, profile, subject || ref.meta)

    ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, ref.meta)
  }

  return ref.testDouble
}

function createPluginStubContext(context: Simulator.Context): SpecPlugin.StubContext {
  return {
    resolve: value => resolveValue(context, value),
    getProperty: options => getProperty(context, options),
    setProperty: options => setProperty(context, options),
    invoke: options => invoke(context, options),
    instantiate: (options, handler) => instantiate(context, options, handler),
    on: options => on(context, options),
  }
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
    return undefined
  }

  const actionId = record.addAction(action)
  const newState: Recorder.State = { ...state, source: { type: 'property', id: actionId, key } }

  logAction(newState, actionId, action)
  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  const result = resolveValue(context, resultAction.payload)

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
    timeTracker.stop()
    throw new ActionMismatch(record.specName, action, expected)
  }

  const actionId = record.addAction(action)
  const newState: Recorder.State = { ...state, source: { type: 'property', id: actionId, key } }

  action.value = record.findRefId(resolveValue(context, value)) || value

  logAction(newState, actionId, action)
  processNextAction(context)
  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  const result = resolveValue(context, resultAction.payload)

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
    if (subject === notDefined) {
      logCreateStub(state, profile, ref.meta)
      ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), undefined, ref.meta)
    }
    else {
      logCreateStub(state, profile, subject)
      ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, ref.meta)
    }
  }
  ref.claimed = true
}

function invoke(context: Simulator.Context,
  { thisArg, args, performer, site }: SpecPlugin.StubContext.invoke.Options,
) {
  const { record, state, timeTracker } = context

  const { ref } = state
  const expected = record.getNextExpectedAction()

  performer = performer || getDefaultPerformer(ref.profile)
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

  if (!expected) {
    timeTracker.stop()
    throw new ExtraAction(record.specName, state, actionId, action)
  }

  const thisArgRef = record.findRef(thisArg)
  if (!thisArgRef) {
    timeTracker.stop()
    throw new ExtraReference(record.specName, thisArg)
  }

  if (thisArgRef.testDouble === notDefined) {
    buildTestDouble({
      ...context,
      state: { ...context.state, source: { type: 'this', id: actionId } }
    }, thisArgRef)
  }
  action.thisArg = record.getRefId(thisArgRef)

  args.forEach((arg, i) => {
    const ref = record.findRef(arg)
    if (ref) {
      if (ref.testDouble === notDefined) {
        buildTestDouble({
          ...context,
          state: { ...context.state, source: { type: 'argument', id: actionId, key: i } }
        }, ref)
      }
      action.payload.push(record.getRefId(ref))
    }
    else {
      action.payload.push(arg)
    }
    return arg
  })

  if (!actionMatches(action, expected)) {
    timeTracker.stop()
    throw new ActionMismatch(record.specName, action, expected)
  }

  logAction(context.state, actionId, action)
  processNextAction(context)
  const resultAction = record.getExpectedResultAction(actionId)
  // in what case the resultAction is undefined?
  // those extra invoke calls by the framework?
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  const resultContext: Simulator.Context = {
    ...context,
    state: { ...context.state, source: { type: 'result', id: actionId } }
  }
  const result = resolveValue(resultContext, resultAction.payload)

  setImmediate(() => processNextAction(context))

  if (resultAction.type === 'return') {
    logAction(resultContext.state, resultActionId, resultAction)
    return result
  }
  else {
    logAction(resultContext.state, resultActionId, resultAction)
    throw result
  }
}

function instantiate(
  context: Simulator.Context,
  { args, performer }: SpecPlugin.StubContext.instantiate.Options,
  handler: SpecPlugin.StubContext.instantiate.Handler,
): SpecPlugin.StubContext.instantiate.Responder {
  const { record, state, timeTracker } = context

  const expected = record.getNextExpectedAction()
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
    const ref = record.findRef(arg)
    if (ref) {
      if (ref.testDouble === notDefined) {
        buildTestDouble({
          ...context,
          state: { ...context.state, source: { type: 'argument', id: actionId, key: i } }
        }, ref)
      }
      action.payload.push(record.getRefId(ref))
    }
    else {
      action.payload.push(arg)
    }
    return arg
  })

  if (!actionMatches(action, expected)) {
    timeTracker.stop()
    throw new ActionMismatch(record.specName, action, expected)
  }

  logAction(context.state, actionId, action)
  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)!
  // in what case the resultAction is undefined?
  // those extra invoke calls by the framework?
  if (!resultAction) new Error('missing result action')

  const resultActionId = record.addAction(resultAction)
  const resultContext: Simulator.Context = {
    ...context,
    state: {
      ...context.state,

      source: { type: 'result', id: actionId }
    }
  }

  const result = resolveValue(resultContext, resultAction.payload, () => handler({ args: spiedArgs }))

  setImmediate(() => processNextAction(context))

  if (resultAction.type === 'return') {
    logAction(resultContext.state, resultActionId, resultAction)
    return result
  }
  else {
    logAction(resultContext.state, resultActionId, resultAction)
    throw result
  }
}

function on(context: Simulator.Context, pluginAction: SpecPlugin.StubContext.PluginAction) {
  context.pendingPluginActions.push({ ...pluginAction, ref: context.state.ref, refId: context.state.refId })
}

function processNextAction(context: Simulator.Context) {
  const { record, pendingPluginActions, timeTracker } = context
  const nextAction = record.getNextExpectedAction()
  const actionId = record.getNextActionId()
  if (!nextAction) return
  switch (nextAction.type) {
    case 'get':
      if (nextAction.performer === 'mockto') {
        processGet(context, nextAction)
        processNextAction(context)
      }
      break
    case 'set':
      if (nextAction.performer === 'mockto') {
        processSet(context, nextAction)
        processNextAction(context)
      }
      break
    case 'invoke':
      if (nextAction.performer === 'mockto') {
        processInvoke(context, actionId, nextAction)
        processNextAction(context)
      }
      else if (nextAction.performer === 'plugin') {
        const pa = pendingPluginActions.find(a => a.type === nextAction.type && a.site === nextAction.site)
        if (!pa) {
          timeTracker.stop()
          throw new ActionMismatch(record.specName, undefined, nextAction)
        }
        pendingPluginActions.splice(pendingPluginActions.indexOf(pa), 1)
        invoke({
          ...context,
          state: {
            ...context.state,
            ref: pa.ref,
            refId: pa.refId,
          }
        }, { thisArg: pa.thisArg, args: pa.args, performer: 'plugin', site: pa.site })
      }
      break
    case 'instantiate':
      if (nextAction.performer === 'mockto') {
        processInstantiate()
        processNextAction(context)
      }
      break
  }
}

function processInstantiate() { }

function processGet(context: Simulator.Context, nextAction: SpecRecord.GetAction) {
  const { record } = context
  const ref = record.getRef(nextAction.refId)
  ref?.testDouble[nextAction.key]
}

function processSet(context: Simulator.Context, nextAction: SpecRecord.SetAction) {
  const { record } = context
  const ref = record.getRef(nextAction.refId)

  ref!.testDouble[nextAction.key] = resolveValue(context, nextAction.value)
}

function resolveValue(context: Simulator.Context, value: any, handler?: () => any) {
  const { record } = context
  const valueRef = typeof value === 'string' ? record.getRef(value) : undefined
  if (valueRef) {
    if (valueRef.testDouble === notDefined) {
      const newContext = {
        ...context,
        state: {
          ...context.state,
          ref: valueRef,
          refId: record.getRefId(valueRef),
          source: undefined
        }
      }
      if (handler) valueRef.subject = handler()
      buildTestDouble(newContext, valueRef)
    }
    return valueRef.testDouble
  }
  else {
    return value
  }
}
function processInvoke(context: Simulator.Context, actionId: SpecRecord.ActionId, action: SpecRecord.InvokeAction) {
  const { record } = context

  const ref = record.getRef(action.refId)!
  const thisArg = resolveValue({
    ...context,
    state: {
      ...context.state,
      source: { type: 'this', id: actionId }
    }
  }, action.thisArg)
  const args = action.payload.map((arg, key) => resolveValue({
    ...context,
    state: {
      ...context.state,
      source: { type: 'argument', id: actionId, key }
    }
  }, arg))
  const target = action.site === undefined ? ref.testDouble : ref.testDouble[action.site]
  return target.apply(thisArg, args)
}
