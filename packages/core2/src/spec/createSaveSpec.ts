import { Except, Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createSpyRecord, SpyRecord } from './createSpyRecord';
import { findPlugin } from './findPlugin';
import { logCreateSpy, logInvokeAction, logResultAction } from './logs';
import { ActionId, ActionMode, InvokeAction, ReferenceSource, ReturnAction, Spec, SpecOptions, SpecReference, SpyContext, SpyInvokeOptions, SpyOptions, SpyResultOptions, ThrowAction, ReferenceId } from './types';
import { SpecPluginInstance } from './types-internal';

export async function createSaveSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {
  const record = createSpyRecord(specId, options)
  return {
    mock: subject => {
      assertMockable(subject)
      return createSpy({ record, subject, mode: 'passive' })!
    },
    async done() {
      record.end()
      const sr = record.getSpecRecord()
      context.io.writeSpec(specId, sr)
    }
  }
}

type CreateSpyOptions<S> = {
  record: Except<SpyRecord, 'getSpecRecord'>,
  subject: S,
  mode: ActionMode,
  source?: ReferenceSource,
}

function createSpy<S>({ record, subject, mode, source }: CreateSpyOptions<S>): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const ref: SpecReference = { plugin: plugin.name, subject, source: source ? { ...source } : undefined, mode }
  const refId = record.addRef(ref)

  logCreateSpy({ plugin: plugin.name, ref: refId }, subject)
  return ref.testDouble = plugin.createSpy(spyContext<S>({ record, plugin, ref, source: { ref: refId, site: [] } }), subject)
}

type SpyContextOptions = {
  record: Except<SpyRecord, 'getSpecRecord'>,
  plugin: SpecPluginInstance,
  ref: SpecReference,
  source: ReferenceSource,
}

/**
 * SpyContext is used by plugin.createSpy().
 */
function spyContext<S>(options: SpyContextOptions): SpyContext<S> {
  return {
    invoke: (args: any[], invokeOptions: SpyInvokeOptions = {}) => invocationRecorder(options, args, invokeOptions),
    getSpy: <A>(subject: A, getOptions: SpyOptions = {}) => getSpy(options, subject, getOptions)
  }
}

function invocationRecorder(
  { record, plugin, ref, source }: SpyContextOptions,
  args: any[],
  { mode, transform, site, meta }: SpyInvokeOptions
) {
  const action: Omit<InvokeAction, 'tick'> = {
    type: 'invoke',
    ref: source.ref as ReferenceId,
    mode: mode || ref.mode,
    payload: [],
    site,
    meta
  }
  const origSourceRef = source.ref
  const invokeId = source.ref = record.addAction(action)

  const spiedArgs = transform ? args.map((a, i) => {
    source.site = [i]
    return transform(a)
  }) : args
  source.ref = origSourceRef

  action.payload.push(...spiedArgs.map(a => record.findRefId(a) || a))

  logInvokeAction({ record, plugin: plugin.name, ref: source.ref }, invokeId, args)

  return {
    args: spiedArgs,
    returns: (value: any, options?: SpyInvokeOptions) => processInvokeResult({ record, plugin, ref, source }, 'return', invokeId, value, options),
    throws: (err: any, options?: SpyResultOptions) => processInvokeResult({ record, plugin, ref, source }, 'throw', invokeId, err, options)
  }
}

function processInvokeResult(
  { record, plugin, source }: SpyContextOptions,
  type: 'return' | 'throw',
  invokeId: ActionId,
  value: any,
  { transform, meta }: SpyResultOptions = {}
) {

  const origSourceRef = source.ref
  const returnId = source.ref = record.getNextActionId()
  source.site = undefined
  const result = transform ? transform(value) : value
  const action: Omit<ReturnAction | ThrowAction, 'tick'> = {
    type,
    ref: invokeId,
    payload: record.findRefId(result) || result,
    meta
  }
  source.ref = origSourceRef

  record.addAction(action)
  logResultAction({ plugin: plugin.name, ref: source.ref }, type, invokeId, returnId, value)
  return result
}

/**
 * NOTE: the specified subject can be already a test double, passed to the system during simulation.
 */
export function getSpy<S>(
  { record, ref, source }: SpyContextOptions,
  subjectOrTestDouble: S, options: SpyOptions
): S {
  const reference = record.findRef(subjectOrTestDouble)
  if (reference) return reference.testDouble
  const mode = options.mode || ref.mode
  source.site = options.site || source.site
  return createSpy({ record, source, mode, subject: subjectOrTestDouble }) || subjectOrTestDouble
}

// function createSpyRecorder<S>(
//   { record, plugin, options: { mode } }: { record: Except<SpyRecord, 'getSpecRecord'>, plugin: string, options: SpyOptions },
//   subject: S,
//   spy: S,
//   declareOptions: DeclareOptions = {}
// ): SpyRecorder<S> {
//   const ref = record.addRef({ plugin, subject, testDouble: spy, mode, meta: declareOptions.meta })

//   logCreateSpy({ plugin, ref }, subject)

//   return {
//     spy,
//     invoke: (args: any[], options?: SpyInvokeOptions) => createInvocationRecorder({ record, plugin }, ref, args, options),
//   }
// }

