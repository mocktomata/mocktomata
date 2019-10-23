import { Except, Omit } from 'type-plus';
import { notDefined } from '../constants';
import { SpyRecord } from './createSpyRecord';
import { findPlugin } from './findPlugin';
import { fixCircularReferences, CircularReference } from './fixCircularReferences';
import { logCreateSpy, logInstantiateAction, logInvokeAction, logResultAction } from './logs';
import { ActionId, ActionMode, InstantiateAction, InvokeAction, ReferenceId, ReferenceSource, ReturnAction, SpecPlugin, SpecReference, ThrowAction } from './types';
import { SpecPluginInstance } from './types-internal';

export type CreateSpyOptions<S> = {
  record: Except<SpyRecord, 'getSpecRecord'>,
  subject: S,
  mode: ActionMode,
  source?: ReferenceSource,
}

export type SpyContext = {
  record: Omit<SpyRecord, 'getSpecRecord'>,
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
  site?: Array<keyof any>,
}
export function createSpy<S>({ record, subject, mode, source }: CreateSpyOptions<S>): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const ref: SpecReference = { plugin: plugin.name, subject, testDouble: notDefined, source, mode }
  const refId = record.addRef(ref)

  logCreateSpy({ plugin: plugin.name, id: refId }, subject)
  const circularRefs: CircularReference[] = []
  ref.testDouble = plugin.createSpy(
    createPluginSpyContext({ record, plugin, ref, refId, circularRefs, currentId: refId }),
    subject)
  fixCircularReferences(record, refId, circularRefs)
  return ref.testDouble
}

/**
 * SpyContext is used by plugin.createSpy().
 */
function createPluginSpyContext(context: SpyContext): SpecPlugin.CreateSpyContext {
  return {
    id: context.refId,
    getSpy: <A>(subject: A, getOptions: SpecPlugin.GetSpyOptions = {}) => getSpy(context, subject, getOptions),
    invoke: (id: ReferenceId, args: any[], invokeOptions: SpecPlugin.InvokeOptions = {}) => invocationRecorder(context, id, args, invokeOptions),
    instantiate: (id: ReferenceId, args: any[], instanceOptions: SpecPlugin.InstantiateOptions = {}) => instanceRecorder(context, id, args, instanceOptions)
  }
}

function invocationRecorder(
  context: SpyContext,
  id: ReferenceId,
  args: any[],
  { mode, processArguments, site, meta }: SpecPlugin.InvokeOptions
) {
  const { record, plugin, ref } = context

  const action: Omit<InvokeAction, 'tick'> = {
    type: 'invoke',
    ref: id,
    mode: mode || ref.mode,
    payload: [],
    site,
    meta
  }
  const invokeId = record.getNextActionId()
  context.currentId = invokeId
  const spiedArgs = processArguments ? args.map((a, i) => {
    context.site = [i]
    return processArguments(a)
  }) : args

  action.payload.push(...spiedArgs.map(a => record.findRefId(a) || a))
  record.addAction(action)
  logInvokeAction({ record, plugin: plugin.name, id }, invokeId, args)

  return {
    args: spiedArgs,
    returns: (value: any, options?: SpecPlugin.InvokeOptions) => processInvokeResult(context, 'return', id, invokeId, value, options),
    throws: (err: any, options?: SpecPlugin.SpyResultOptions) => processInvokeResult(context, 'throw', id, invokeId, err, options)
  }
}

function processInvokeResult(
  context: SpyContext,
  type: 'return' | 'throw',
  referenceId: ReferenceId,
  invokeId: ActionId,
  value: any,
  { processArgument, meta }: SpecPlugin.SpyResultOptions = {}
) {
  const { record, plugin } = context
  const returnId = record.getNextActionId()
  context.currentId = returnId
  context.site = undefined
  const result = processArgument ? processArgument(value) : value
  const action: Omit<ReturnAction | ThrowAction, 'tick'> = {
    type,
    ref: invokeId,
    payload: record.findRefId(result) || result,
    meta
  }

  record.addAction(action)
  logResultAction({ plugin: plugin.name, id: referenceId }, type, invokeId, returnId, value)
  return result
}

/**
 * NOTE: the specified subject can be already a test double, passed to the system during simulation.
 */
export function getSpy<S>(
  context: SpyContext,
  subjectOrTestDouble: S,
  options: SpecPlugin.GetSpyOptions
): S {
  const { record, ref } = context
  const reference = record.findRef(subjectOrTestDouble)
  if (reference) {
    if (reference.testDouble === notDefined) {
      const subjectId = record.findRefId(subjectOrTestDouble)!
      context.circularRefs.push({ sourceId: context.refId, sourceSite: options.site || [], subjectId })
    }
    return reference.testDouble
  }
  const mode = options.mode || ref.mode
  const site = options.site
  return createSpy({ record, source: { ref: context.currentId, site }, mode, subject: subjectOrTestDouble }) || subjectOrTestDouble
}

export function instanceRecorder(
  context: SpyContext,
  id: ReferenceId,
  args: any[],
  { mode, processArguments, meta }: SpecPlugin.InstantiateOptions
): SpecPlugin.InstantiationRecorder {
  const { record, plugin, ref } = context

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

  let instanceId: ReferenceId
  return {
    args: spiedArgs,
    setInstance: instance => {
      const reference: SpecReference = { plugin: plugin.name, mode: 'instantiate', testDouble: instance, subject: notDefined }
      instanceId = record.addRef(reference)
      context.currentId = instanceId
      return record.getAction<InstantiateAction>(instantiateId).instanceId = instanceId
    }
  }
}
