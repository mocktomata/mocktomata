import { Except } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createSpyRecord, SpyRecord } from './createSpyRecord';
import { findPlugin } from './findPlugin';
import { logCreateSpy, logInvokeAction, logReturnAction, logThrowAction } from './logs';
import { ActionId, InvokeAction, InvokeOptions, Meta, ReferenceId, ReturnAction, Spec, SpecOptions, SpyContext, SpyOptions, SpyRecorder, ThrowAction } from './types';

export async function createSaveSpec(context: SpecContext, id: string, options: SpecOptions): Promise<Spec> {

  const record = createSpyRecord(options)

  return {
    mock: subject => {
      assertMockable(subject)
      return getSpy(record, subject, { mode: 'passive' })!
    },
    async done() {
      record.end()
      const sr = record.getSpecRecord()
      context.io.writeSpec(id, sr)
    }
  }
}

function getSpy<S>(record: SpyRecord, subject: S, options: SpyOptions): S {
  const spy = record.findTestDouble(subject)
  if (spy) return spy

  return createSpy(record, subject, options) || subject
}

function createSpy<S>(record: SpyRecord, subject: S, options: SpyOptions): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const context = createSpyContext(record, plugin.name, subject, options)
  return plugin.createSpy(context, subject)
}

/**
 * SpyContext is used by plugin.createSpy().
 */
function createSpyContext(record: SpyRecord, plugin: string, subject: any, options: SpyOptions): SpyContext {
  return {
    declare: (spy: any, meta?: Meta) => createSpyRecorder({ record, plugin, options }, subject, spy, meta),
    getSpy: (subject: any, options: SpyOptions) => getSpy(record, subject, options)
  }
}

function createSpyRecorder(
  { record, plugin, options: { mode } }: { record: SpyRecord, plugin: string, options: SpyOptions },
  subject: any,
  spy: any,
  meta: Meta | undefined
): SpyRecorder {
  const ref = record.addRef({ plugin, subject, testDouble: spy, mode, meta })

  logCreateSpy({ plugin, ref }, subject)

  return {
    invoke: (args: any[], options?: InvokeOptions) => createInvocationRecorder({ record, plugin }, ref, args, options),
  }
}

function createInvocationRecorder(
  { record, plugin }: { record: SpyRecord, plugin: string },
  ref: ReferenceId,
  args: any[],
  options: InvokeOptions = {}
) {
  const reference = record.getRef(ref)
  const action: Except<InvokeAction, 'tick'> = { type: 'invoke', ref, mode: options.mode || reference.mode } as any
  const id = record.addAction(action)
  action.payload = options.transform ? args.map(options.transform) : args

  logInvokeAction({ record, plugin, ref }, id, args)

  return {
    returns: (value: any, options?: InvokeOptions) => expressionReturns({ record, plugin, ref, id }, value, options),
    throws: (err: any, options?: InvokeOptions) => expressionThrows({ record, plugin, ref, id }, err, options)
  }
}

function expressionReturns(
  { record, plugin, ref, id }: { record: SpyRecord, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: InvokeOptions = {}
) {
  const action: Except<ReturnAction, 'tick'> = { type: 'return', ref: id, payload: undefined }
  const returnId = record.addAction(action)
  const spy = options.transform ? options.transform(value) : value
  logReturnAction({ plugin, ref }, id, returnId, value)
  return spy
}

function expressionThrows(
  { record, plugin, ref, id }: { record: SpyRecord, plugin: string, ref: ReferenceId, id: ActionId },
  value: any,
  options: InvokeOptions = {}
) {
  const action: Except<ThrowAction, 'tick'> = { type: 'throw', ref: id, payload: undefined }
  const returnId = record.addAction(action)
  const spy = options.transform ? options.transform(value) : value
  logThrowAction({ plugin, ref }, id, returnId, value)
  return spy
}
