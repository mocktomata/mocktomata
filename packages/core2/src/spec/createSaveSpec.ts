import { Except, Omit, required } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createContextTracker } from './createContextTracker';
import { createSpyRecord, SpyRecord } from './createSpyRecord';
import { findPlugin } from './findPlugin';
import { logCreateSpy, logInvokeAction, logReturnAction, logThrowAction } from './logs';
import { ActionId, InvokeAction, ReferenceId, ReturnAction, Spec, SpecOptions, SpecReference, SpyContext, SpyInvokeOptions, SpyOptions, ThrowAction } from './types';

export async function createSaveSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {

  const record = createSpyRecord(specId, options)
  const contextTracker = createContextTracker()
  return {
    mock: subject => {
      assertMockable(subject)
      return createSpy({ record, contextTracker }, subject, { mode: 'passive', sourceSite: [] })!
    },
    async done() {
      record.end()
      const sr = record.getSpecRecord()
      context.io.writeSpec(specId, sr)
    }
  }
}
export type SpyContextInternal = {
  record: Except<SpyRecord, 'getSpecRecord'>,
  contextTracker: ReturnType<typeof createContextTracker>,
}

function createSpy<S>({ record, contextTracker }: SpyContextInternal, subject: S, options: SpyOptions): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const reference: SpecReference = { plugin: plugin.name, subject, mode: options.mode }

  if (contextTracker.sourceId !== undefined) {
    reference.source = {
      ref: contextTracker.sourceId,
      site: contextTracker.sourceSite
    }
  }

  const refId = record.addRef(reference)
  contextTracker.sourceId = refId
  const context = createSpyContext<S>({ record, contextTracker }, plugin.name, refId, options)
  reference.testDouble = plugin.createSpy(context, subject)
  logCreateSpy({ plugin: plugin.name, ref: refId }, subject)
  return reference.testDouble
}

/**
 * SpyContext is used by plugin.createSpy().
 */
function createSpyContext<S>({ record, contextTracker }: SpyContextInternal, plugin: string, ref: ReferenceId, options: SpyOptions): SpyContext<S> {
  return {
    // declare: (spy: S, declareOptions?: DeclareOptions) => createSpyRecorder<S>({ record, plugin, options }, subject, spy, declareOptions),
    getSpy: <A>(subject: A, newOptions?: Partial<SpyOptions>) => {
      const opt = required(options, newOptions)
      if (opt.sourceSite) {
        contextTracker.sourceSite = opt.sourceSite
      }
      return getSpy<A>({ record, contextTracker }, subject, opt)
    },
    invoke: (args: any[], options?: SpyInvokeOptions) => createInvocationRecorder({ record, contextTracker }, plugin, ref, args, options),
  }
}

/**
 * NOTE: the specified subject can be already a test double, passed to the system during simulation.
 */
export function getSpy<S>({ record, contextTracker }: SpyContextInternal, subjectOrTestDouble: S, options: SpyOptions): S {
  const reference = record.findRef(subjectOrTestDouble)
  if (reference) return reference.testDouble

  return createSpy({ record, contextTracker }, subjectOrTestDouble, options) || subjectOrTestDouble
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

function createInvocationRecorder(
  { record, contextTracker }: SpyContextInternal,
  plugin: string,
  ref: ReferenceId,
  args: any[],
  options: SpyInvokeOptions = {}
) {
  const reference = record.getRef(ref)!
  const action: Omit<InvokeAction, 'tick'> = {
    type: 'invoke',
    ref,
    mode: options.mode || reference.mode,
    payload: []
  }
  const id = record.addAction(action)
  contextTracker.sourceId = id
  const spiedArgs = options.transform ? args.map((a, i) => {
    contextTracker.sourceSite = [i]
    return options.transform!(a)
  }) : args
  action.payload.push(...spiedArgs.map(a => record.findRefId(a) || a))

  logInvokeAction({ record, plugin, ref }, id, args)

  return {
    args: spiedArgs,
    returns: (value: any, options?: SpyInvokeOptions) => expressionReturns({ record, plugin, ref, id }, value, options),
    throws: (err: any, options?: SpyInvokeOptions) => expressionThrows({ record, plugin, ref, id }, err, options)
  }
}

function expressionReturns(
  { record, plugin, ref, id }: { record: Except<SpyRecord, 'getSpecRecord'>, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: SpyInvokeOptions = {}
) {
  const result = options.transform ? options.transform(value) : value
  const action: Omit<ReturnAction, 'tick'> = {
    type: 'return',
    ref: id,
    payload: record.findRefId(result) || value
  }
  const returnId = record.addAction(action)
  logReturnAction({ plugin, ref }, id, returnId, value)
  return result
}

function expressionThrows(
  { record, plugin, ref, id }: { record: Except<SpyRecord, 'getSpecRecord'>, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: SpyInvokeOptions = {}
) {
  const result = options.transform ? options.transform(value) : value
  const action: Omit<ThrowAction, 'tick'> = {
    type: 'throw',
    ref: id,
    payload: record.findRefId(result) || value
  }
  const throwId = record.addAction(action)
  logThrowAction({ plugin, ref }, id, throwId, value)
  return result
}
