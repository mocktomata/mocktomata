import { Omit, RequiredPick } from 'type-plus';
import { notDefined } from '../constants';
import { assertActionType, ValidateRecord } from './createValidateRecord';
import { ActionMismatch, PluginNotFound, ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { CircularReference, fixCircularReferences } from './fixCircularReferences';
import { logCreateStub, logInstantiateAction, logInvokeAction, logResultAction, logGetAction } from './logs';
import { getSpy } from './spying';
import { ActionId, InstantiateAction, InvokeAction, ReferenceId, ReferenceSource, ReturnAction, SpecAction, SpecPlugin, SpecReference, ThrowAction, SupportedKeyTypes, GetAction } from './types';
import { SpecPluginInstance } from './types-internal';
import { arrayMismatch, referenceMismatch, siteMismatch } from './validations';

export type CreateStubOptions<S> = {
  record: ValidateRecord,
  subject: S,
  source?: ReferenceSource,
}

export type StubContextInternal = {
  record: ValidateRecord,
  source?: ReferenceSource
}

export function createStub<S>({ record, subject, source }: CreateStubOptions<S>): S {
  const expected = record.getExpectedReference()
  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }

  return createStubInternal(record, plugin, subject, expected, source)
}

function createStubInternal(record: ValidateRecord, plugin: RequiredPick<SpecPlugin, 'name'>, subject: any, expected: SpecReference, source: any) {
  const ref: SpecReference = {
    plugin: plugin.name,
    subject,
    testDouble: notDefined,
    source,
    mode: expected.mode
  }
  if (referenceMismatch(ref, expected)) throw new ReferenceMismatch(record.specId, ref, expected)
  const refId = record.addRef(ref)
  logCreateStub({ plugin: plugin.name, id: refId })
  const circularRefs: CircularReference[] = []
  ref.testDouble = plugin.createStub(
    createPluginStubContext({ record, plugin, ref, refId, circularRefs, currentId: refId }),
    subject,
    expected.meta)
  fixCircularReferences(record, refId, circularRefs)
  return ref.testDouble
}

export type StubContext = {
  record: ValidateRecord,
  /**
   * This need to be passed to all spy contexts,
   * to every getSpy/createSpy.
   * NOTE: that means it probably can be absorbed into `record`.
   */
  circularRefs: CircularReference[],
  plugin: SpecPluginInstance,
  refId: ReferenceId,
  ref: SpecReference,
  currentId: ReferenceId | ActionId,
  site?: Array<SupportedKeyTypes>,
}

export function createPluginStubContext(context: StubContext): SpecPlugin.StubContext {
  return {
    invoke: (args: any[], invokeOptions: SpecPlugin.InvokeOptions = {}) => invocationResponder(context, args, invokeOptions),
    getProperty: (property) => getProperty(context, property),
    getSpy: <A>(subject: A, getOptions: SpecPlugin.GetSpyOptions = {}) => getSpy(context, subject, getOptions),
    resolve: <V>(refOrValue: V, resolveOptions: SpecPlugin.ResolveOptions = {}) => resolve(context, refOrValue, resolveOptions),
    instantiate: (args: any[], instanceOptions: SpecPlugin.InstantiateOptions = {}) => instanceResponder(context, args, instanceOptions)
  }
}

function resolve(context: StubContext, refOrValue: any, resolveOptions: SpecPlugin.ResolveOptions) {
  if (typeof refOrValue !== 'string') return refOrValue
  const { record } = context
  const site = resolveOptions.site
  const reference = record.getRef(refOrValue)
  if (reference) {
    if (reference.testDouble === notDefined) {
      context.circularRefs.push({ sourceId: context.currentId, sourceSite: site || [], subjectId: refOrValue })
    }
    return reference.testDouble
  }

  // ref is from saved record, so the original reference must exists.
  const origRef = record.getOriginalRef(refOrValue)!

  if (!origRef.source) {
    throw new Error(`no source found for ${refOrValue}`)
  }

  if (siteMismatch(site, origRef.source.site)) {
    throw new ReferenceMismatch(record.specId, { ...origRef, source: { ref: origRef.source.ref, site } }, origRef)
  }
  const sourceRef = record.getRef(origRef.source.ref)!
  const subject = getByPath(sourceRef.subject, origRef.source.site || [])
  const plugin = getPlugin(origRef.plugin)
  return createStubInternal(record, plugin, subject, origRef, { ref: context.currentId, site })
}
function getByPath(subject: any, sitePath: Array<string | number>) {
  if (subject === undefined) return subject
  return sitePath.reduce((p, s) => p[s], subject)
}

function getProperty(context: StubContext, property: SupportedKeyTypes) {
  const { record, plugin, refId } = context
  const expected = record.getExpectedAction() as GetAction
  // The current getProperty call may be caused by framework access.
  // Those calls will not be record and simply ignored.
  // The one I have indentified is `then` check,
  // properly by TypeScript for checking if the object is a promise
  if (!expected ||
    expected.type !== 'get' ||
    expected.site[0] !== property
  ) return undefined

  const refOrValue = expected.payload
  const nextId = record.getNextActionId()
  const site = [property]

  if (typeof refOrValue !== 'string') {
    const action: Omit<GetAction, 'tick'> = {
      type: 'get',
      ref: refId,
      payload: refOrValue,
      site
    }
    record.addAction(action)
    logGetAction({ plugin: plugin.name, id: refId }, nextId, property, refOrValue)
    return refOrValue
  }

  const reference = record.getRef(refOrValue)
  if (reference) {
    if (!reference.source || reference.source.ref !== refId || !siteMismatch(site, reference.source.site)) return undefined

    if (reference.testDouble === notDefined) {
      context.circularRefs.push({ sourceId: context.currentId, sourceSite: site || [], subjectId: refOrValue })
    }

    const action: Omit<GetAction, 'tick'> = {
      type: 'get',
      ref: refId,
      payload: reference.testDouble,
      site
    }
    record.addAction(action)
    logGetAction({ plugin: plugin.name, id: refId }, nextId, property, reference.subject)
    return reference.testDouble
  }

  // ref is from saved record, so the original reference must exists.
  const origRef = record.getOriginalRef(refOrValue)!
  if (!origRef.source || origRef.source.ref !== refId || siteMismatch(site, origRef.source.site)) {
    return undefined
  }
  const sourceRef = record.getRef(origRef.source.ref)!
  const subject = getByPath(sourceRef.subject, origRef.source.site || [])
  const result = createStubInternal(record,
    getPlugin(origRef.plugin),
    subject,
    origRef,
    { ref: context.currentId, site })

  // const resultRef = record.findRef(result)

  const value = expected.payload[1]

  const action: Omit<GetAction, 'tick'> = {
    type: 'get',
    ref: refId,
    payload: value,
    site
  }
  record.addAction(action)
  logGetAction({ plugin: plugin.name, id: refId }, nextId, property, value)
  return result
}

function invocationResponder(
  context: StubContext,
  args: any[],
  { mode, processArguments, site, meta }: SpecPlugin.InvokeOptions
): SpecPlugin.InvocationResponder {
  const { record, plugin, ref, refId: id } = context
  const expected = record.getExpectedAction()

  const action: Omit<InvokeAction, 'tick'> = {
    type: 'invoke',
    ref: id,
    mode: mode || (ref.mode === 'instantiate' ? 'passive' : ref.mode),
    payload: [],
    site,
    meta
  }
  const invokeId = record.getNextActionId()
  context.currentId = invokeId
  const stubArgs = processArguments ? args.map((a, i) => {
    context.site = [i]
    return processArguments(a)
  }) : args

  action.payload.push(...stubArgs.map(a => record.findRefId(a) || a))
  if (actionMismatch(action, expected)) {
    throw new ActionMismatch(record.specId, action, expected)
  }
  record.addAction(action)
  logInvokeAction({ record, plugin: plugin.name, id }, invokeId, args)

  return {
    getResult: () => {
      const expected = record.getExpectedAction() as ReturnAction | ThrowAction
      return getResult(record, expected)
    },
    getResultAsync: () => {
      return new Promise(a => {
        record.onAddAction(() => {
          const expected = record.getExpectedAction() as ReturnAction | ThrowAction
          if (expected && expected.ref === invokeId) {
            a(getResult(record, expected))
          }
        })
      })
    },
    returns(value: any) {
      const expected = record.getExpectedAction()
      assertActionType(record.specId, 'return', expected)
      logResultAction({ plugin: plugin.name, id }, 'return', invokeId, record.getNextActionId(), value)
      record.addAction({ type: 'return', ref: invokeId, payload: record.findRefId(value) || value })
      return value
    },
    throws(value: any) {
      const expected = record.getExpectedAction()
      assertActionType(record.specId, 'throw', expected)
      logResultAction({ plugin: plugin.name, id }, 'throw', invokeId, record.getNextActionId(), value)
      record.addAction({ type: 'throw', ref: invokeId, payload: record.findRefId(value) || value })
      return value
    },
  }
}

function getResult(record: ValidateRecord, expected: ReturnAction | ThrowAction) {
  if (typeof expected.payload !== 'string') {
    return {
      type: expected.type,
      value: expected.payload,
      meta: expected.meta
    }
  }

  const expectedReference = record.getOriginalRef(expected.payload)!
  const actualReference = record.getRef(expected.payload)
  if (actualReference) {
    return {
      type: expected.type,
      value: actualReference.testDouble,
      meta: expected.meta
    }
  }

  const plugin = getPlugin(expectedReference.plugin)
  const ref: SpecReference = {
    plugin: plugin.name,
    mode: expectedReference.mode,
    subject: notDefined,
    testDouble: notDefined,
    source: expectedReference.source
  }
  const refId = record.addRef(ref)

  const circularRefs: CircularReference[] = []
  const context = createPluginStubContext({ record, plugin, ref, refId, circularRefs, currentId: refId })

  logCreateStub({ plugin: plugin.name, id: refId })
  ref.testDouble = plugin.createStub(context, expectedReference.subject, expectedReference.meta)
  fixCircularReferences(record, refId, circularRefs)

  return {
    type: expected.type,
    value: ref.testDouble,
    meta: expected.meta,
  }
}

function actionMismatch(actual: Omit<SpecAction, 'tick'>, expected: SpecAction) {
  return actual.type !== expected.type ||
    actual.ref !== expected.ref ||
    arrayMismatch(actual.payload, expected.payload)
}

function instanceResponder(
  context: StubContext,
  args: any[],
  { mode, processArguments, meta }: SpecPlugin.InstantiateOptions
): SpecPlugin.InstantiationResponder {
  const { record, plugin, ref, refId: id } = context

  const action: Omit<InstantiateAction, 'tick' | 'instanceId'> = {
    type: 'instantiate',
    ref: id,
    mode: mode || ref.mode,
    payload: [],
    meta
  }
  const instantiateId = record.getNextActionId()
  context.currentId = instantiateId
  const spiedArgs = processArguments ? args.map((a, i) => {
    context.site = [i]
    return processArguments(instantiateId, a)
  }) : args

  action.payload.push(...spiedArgs.map(a => record.findRefId(a) || a))
  record.addAction(action)
  logInstantiateAction({ record, plugin: plugin.name, id }, instantiateId, args)

  let instanceRef: SpecReference
  let instanceId: ReferenceId
  return {
    args: spiedArgs,
    setInstance: instance => {
      instanceRef = { plugin: plugin.name, mode: 'instantiate', testDouble: instance, subject: notDefined }
      instanceId = record.addRef(instanceRef)
      context.currentId = instanceId
      return record.getAction<InstantiateAction>(instantiateId).instanceId = instanceId
    },
    invoke: (args: any[], invokeOptions: SpecPlugin.InvokeOptions = {}) => invocationResponder({ ...context, ref: instanceRef!, refId: instanceId! }, args, invokeOptions),
  }
}
