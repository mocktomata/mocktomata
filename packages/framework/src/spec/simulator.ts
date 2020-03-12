import { PartialPick } from 'type-plus'
import { notDefined } from '../constants'
import { findPlugin, getPlugin } from '../spec-plugin/findPlugin'
import { SpecPlugin } from '../spec-plugin/types'
import { SpecRecord } from '../spec-record/types'
import { getArgumentContext, getPropertyContext, getResultContext, getThisContext } from '../utils-internal'
import { actionMatches } from './actionMatches'
import { createTimeTracker, TimeTracker } from '../timeTracker/createTimeTracker'
import { ActionMismatch, ExtraAction, ExtraReference, MissingAction, NoSupportedPlugin, PluginsNotLoaded } from './errors'
import { logAction, logCreateSpy, logCreateStub, logRecordingTimeout } from './logs'
import { createSpecRecordValidator, SpecRecordValidator, ValidateReference } from './record'
import { createPluginSpyContext } from './recorder'
import { getDefaultPerformer } from './subjectProfile'
import { Spec } from './types'
import { Recorder, SpecRecordLive } from './types-internal'
import { referenceMismatch } from './validations'
import { AsyncContext } from 'async-fp'

export namespace Simulator {
  export type Context = {
    plugins: SpecPlugin.Instance[],
    timeTracker: TimeTracker,
    record: SpecRecordValidator,
    state: Recorder.State,
    spyOptions: Array<Recorder.SpyOption>,
    pendingPluginActions: Array<SpecPlugin.StubContext.PluginAction & { ref: SpecRecordLive.Reference, refId: SpecRecord.ReferenceId }>
  }
}

export function createSimulator(context: AsyncContext<Spec.Context>, specName: string, loaded: SpecRecord, options: Spec.Options) {
  // istanbul ignore next
  const timeTracker = createTimeTracker(options, elasped => logRecordingTimeout(specName, elasped))
  const ctx = context.merge(async context => {
    const { timeTrackers } = await context.get()
    timeTrackers.push(timeTracker)
    return {}
  }, { lazy: true })
  const record = createSpecRecordValidator(specName, loaded)

  return {
    createStub: <S>(subject: S) => ctx.get().then(({ plugins }) => {
      assertPluginsLoaded(plugins, specName, loaded.refs)
      record.setPlugins(plugins)
      return createStub({
        plugins,
        record,
        timeTracker,
        spyOptions: [],
        pendingPluginActions: []
      }, subject, { profile: 'target' })
    }),
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
  }
}

function assertPluginsLoaded(plugins: SpecPlugin.Instance[], specName: string, refs: SpecRecord.Reference[]) {
  const pluginsInUse = refs.reduce<string[]>((p, v) => {
    if (p.indexOf(v.plugin) === -1) p.push(v.plugin)
    return p
  }, [])

  const pluginsMissing = pluginsInUse.filter(p => {
    try { return !getPlugin(plugins, p) }
    catch (e) { return true }
  })
  if (pluginsMissing.length > 0) {
    throw new PluginsNotLoaded(specName, pluginsMissing)
  }
}

function createStub<S>(context: PartialPick<Simulator.Context, 'state'>, subject: S, options: { profile: SpecRecord.SubjectProfile }): S {
  const { record, timeTracker, plugins } = context

  // const plugin = subject === notDefined ? getPlugin(expected.plugin) : findPlugin(subject)
  const plugin = findPlugin(plugins, subject)

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

  // `context.state` can only be undefined at `createSimulator()`. At that time `options.profile` is default to `target`
  // so `context.state` will always be defined in this line.
  const profile = options.profile

  const source = context.state?.source

  referenceMismatch({ plugin: plugin.name, profile, source }, ref)
  const refId = record.getRefId(ref)
  const state = { ref, refId }
  logCreateStub(state, profile, subject || ref.meta)

  ref.testDouble = plugin.createStub(createPluginStubContext({ ...context, state }), subject, ref.meta)

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

  if (!actionMatches(record, action, expected)) {
    // getProperty calls may be caused by framework access.
    // Those calls will not be record and simply ignored.
    return undefined
  }

  const actionId = record.addAction(action)
  logAction(state, actionId, action)
  processNextAction(context)

  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  const resultContext = getPropertyContext(context, actionId, key)

  const result = resolveValue(resultContext, resultAction.payload)

  logAction(resultContext.state, resultActionId, resultAction)
  if (resultAction.type === 'return') return result
  throw result
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

  action.value = record.findRefId(resolveValue(context, value)) || value
  if (!actionMatches(record, action, expected)) {
    timeTracker.stop()
    throw new ActionMismatch(record.specName, action, expected)
  }

  const actionId = record.addAction(action)

  logAction(context.state, actionId, action)
  processNextAction(context)
  const resultAction = record.getExpectedResultAction(actionId)
  if (!resultAction) return undefined

  const resultActionId = record.addAction(resultAction)
  const resultContext = getPropertyContext(context, actionId, key)
  const result = resolveValue(resultContext, resultAction.payload)

  logAction(resultContext.state, resultActionId, resultAction)
  if (resultAction.type === 'return') return result
  throw result
}
function buildTestDouble(context: Simulator.Context, ref: ValidateReference) {
  const { record, plugins } = context
  const plugin = getPlugin(plugins, ref.plugin)
  const profile = ref.profile
  const subject = ref.subject
  const refId = record.getRefId(ref)
  const state = { ref, refId }
  if (profile === 'input') {
    logCreateSpy(state, profile, subject)
    // about `as any`: RecordValidator does not have `addRef` and `getSpecRecord` and they are not needed for this
    ref.testDouble = plugin.createSpy(createPluginSpyContext({ ...context, state } as any), subject)
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
    buildTestDouble(getThisContext(context, actionId), thisArgRef)
  }
  action.thisArg = record.getRefId(thisArgRef)

  args.forEach((arg, key) => {
    const ref = record.findRef(arg)
    if (ref) {
      if (ref.testDouble === notDefined) {
        buildTestDouble(getArgumentContext(context, actionId, key), ref)
      }
      action.payload.push(record.getRefId(ref))
    }
    else {
      action.payload.push(arg)
    }
    return arg
  })

  if (!actionMatches(record, action, expected)) {
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
  const resultContext = getResultContext(context, actionId)
  const result = resolveValue(resultContext, resultAction.payload)

  setImmediate(() => processNextAction(context))

  logAction(resultContext.state, resultActionId, resultAction)
  if (resultAction.type === 'return') return result
  throw result
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

  const spiedArgs = args.map((arg, key) => {
    const ref = record.findRef(arg)
    if (ref) {
      if (ref.testDouble === notDefined) {
        buildTestDouble(getArgumentContext(context, actionId, key), ref)
      }
      action.payload.push(record.getRefId(ref))
    }
    else {
      action.payload.push(arg)
    }
    return arg
  })

  if (!actionMatches(record, action, expected)) {
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
  const resultContext = getResultContext(context, actionId)
  const result = resolveValue(resultContext, resultAction.payload, () => handler({ args: spiedArgs }))
  setImmediate(() => processNextAction(context))

  logAction(resultContext.state, resultActionId, resultAction)
  if (resultAction.type === 'return') return result
  throw result
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

        // Can't find a test case to cover this yet.
        // istanbul ignore next
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
        processInstantiate(context, actionId, nextAction)
        processNextAction(context)
      }
      break
  }
}

function processInstantiate(context: Simulator.Context, actionId: SpecRecord.ActionId, action: SpecRecord.InstantiateAction) {
  const { record } = context

  const ref = record.getRef(action.refId)!
  const args = action.payload.map((arg, key) => resolveValue(getArgumentContext(context, actionId, key), arg))
  const target = ref.testDouble
  return new target(...args)
}

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
      if (handler) valueRef.subject = handler()
      buildTestDouble({
        ...context,
        state: {
          ...context.state,
          ref: valueRef,
          refId: record.getRefId(valueRef),
          source: undefined
        }
      }, valueRef)
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
  const thisArg = resolveValue(getThisContext(context, actionId), action.thisArg)
  const args = action.payload.map((arg, key) => resolveValue(getArgumentContext(context, actionId, key), arg))
  const target = action.site === undefined ? ref.testDouble : ref.testDouble[action.site]
  return target.apply(thisArg, args)
}
