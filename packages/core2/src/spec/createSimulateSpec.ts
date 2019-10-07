import { Omit } from 'type-plus';
import { notDefined } from '../constants';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { getSpy, instanceRecorder } from './createSaveSpec';
import { createSimulator } from './createSimulator';
import { assertActionType, createValidateRecord, ValidateRecord } from './createValidateRecord';
import { ActionMismatch, PluginNotFound, ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { CircularReference, fixCircularReferences } from './fixCircularReferences';
import { logCreateStub, logInvokeAction, logResultAction } from './logs';
import { ActionId, InvokeAction, ReferenceId, ReferenceSource, ReturnAction, Spec, SpecAction, SpecOptions, SpecPlugin, SpecReference, ThrowAction } from './types';
import { SpecPluginInstance } from './types-internal';
import { referenceMismatch, siteMismatch, arrayMismatch } from './validations';

export async function createSimulateSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {
  const loaded = await context.io.readSpec(specId)

  const record = createValidateRecord(specId, loaded, options)
  const simulator = createSimulator(record, options)
  record.onAddAction(simulator.run)

  return {
    mock: subject => {
      assertMockable(subject)
      return createStub({ record, subject })
    },
    async done() { }
  }
}
type CreateStubOptions<S> = {
  record: ValidateRecord,
  subject: S,
  source?: ReferenceSource,
}

export type StubContextInternal = {
  record: ValidateRecord,
  source?: ReferenceSource
}

function createStub<S>({ record, subject, source }: CreateStubOptions<S>): S {
  const expected = record.getExpectedReference()

  const plugin = findPlugin(subject)
  if (!plugin) {
    throw new PluginNotFound(expected.plugin)
  }

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
    createPluginStubContext({ record, plugin, ref, refId, circularRefs }),
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
  site?: Array<keyof any>,
}

export function createPluginStubContext(context: StubContext): SpecPlugin.CreateStubContext {
  return {
    id: context.refId,
    invoke: (id: ReferenceId, args: any[], invokeOptions: SpecPlugin.InvokeOptions = {}) => invocationResponder(context, id, args, invokeOptions),
    getSpy: <A>(id: ActionId, subject: A, getOptions: SpecPlugin.GetSpyOptions = {}) => getSpy(context, id, subject, getOptions),
    resolve: <V>(id: ReferenceId, refOrValue: V, resolveOptions: SpecPlugin.ResolveOptions = {}) => {
      if (typeof refOrValue !== 'string') return refOrValue
      const { record } = context

      const reference = record.getRef(refOrValue)
      if (reference) {
        if (reference.testDouble === notDefined) {
          context.circularRefs.push({ sourceId: id, sourceSite: resolveOptions.site || [], subjectId: refOrValue })
        }
        return reference.testDouble
      }

      // ref is from saved record, so the original reference must exists.
      const origRef = record.getOriginalRef(refOrValue)!
      if (!origRef.source) {
        throw new Error(`no source found for ${refOrValue}`)
      }

      const site = resolveOptions.site
      if (siteMismatch(site, origRef.source.site)) {
        throw new ReferenceMismatch(record.specId, { ...origRef, source: { ...origRef.source, site } }, origRef)
      }
      const sourceRef = record.getRef(origRef.source.ref)!
      const subject = getByPath(sourceRef.subject, origRef.source.site || [])
      return createStub<V>({ record, subject, source: { ref: id, site } })
    },
    instantiate: (id: ReferenceId, args: any[], instanceOptions: SpecPlugin.InstantiateOptions = {}) => instanceRecorder(context, id, args, instanceOptions)
    // declare: <S>(stub: S) => createStubRecorder<S>({ record, plugin }, stub),
    // getStub: <A>(subject: A) => getStub<A>({ record }, subject)
  }
}

function getByPath(subject: any, sitePath: Array<string | number>) {
  return sitePath.reduce((p, s) => p[s], subject)
}

// function getStub<S>({ record }: { record: ValidateRecord }, subject: S): S {
//   const stub = record.findTestDouble(subject)
//   if (stub) return stub

//   return createStub({ record }, subject) || subject
// }

// function createStubRecorder<S>(
//   { record, plugin }: RecorderContext,
//   stub: S
// ): StubRecorder<S> {
//   const ref = record.addRef({ plugin, testDouble: stub })

//   logCreateStub({ plugin, ref })

//   return {
//     stub,
//     invoke: (args: any[]) => createInvocationResponder({ record, plugin }, ref, args)
//   }
// }

function invocationResponder(
  context: StubContext,
  id: ReferenceId,
  args: any[],
  { mode, processArguments, site, meta }: SpecPlugin.InvokeOptions
): SpecPlugin.InvocationResponder {
  const { record, plugin, ref } = context
  const expected = record.getExpectedAction()

  const action: Omit<InvokeAction, 'tick'> = {
    type: 'invoke',
    ref: id,
    mode: mode || ref.mode,
    payload: [],
    site,
    meta
  }
  const invokeId = record.getNextActionId()

  const stubArgs = processArguments ? args.map((a, i) => {
    context.site = [i]
    return processArguments(invokeId, a)
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
  const ref: SpecReference = { plugin: plugin.name, mode: expectedReference.mode, testDouble: notDefined, source: expectedReference.source }
  const refId = record.addRef(ref)

  const circularRefs: CircularReference[] = []
  const context = createPluginStubContext({ record, plugin, ref, refId: refId, circularRefs })

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
