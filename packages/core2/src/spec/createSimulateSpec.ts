import { Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createValidateRecord, ValidateRecord } from './createValidateRecord';
import { findPlugin, getPlugin } from './findPlugin';
import { logCreateStub, logInvokeAction } from './logs';
import { InvocationResponder, InvokeAction, Meta, ReferenceId, ReturnAction, Spec, SpecOptions, SpyInvokeOptions, StubContext, StubInvokeOptions, StubRecorder, ThrowAction } from './types';

export async function createSimulateSpec(context: SpecContext, id: string, options: SpecOptions): Promise<Spec> {
  const loaded = await context.io.readSpec(id)

  const record = createValidateRecord(id, loaded, options)

  return {
    mock: subject => {
      assertMockable(subject)
      return getStub(record, subject)
    },
    async done() { }
  }
}

function getStub<S>(record: ValidateRecord, subject: S): S {
  const stub = record.findTestDouble(subject)
  if (stub) return stub

  return createStub(record, subject) || subject
}

function createStub<S>(record: ValidateRecord, subject: S): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const context = createStubContext(record, plugin.name, subject)
  return plugin.createStub(context, subject)
}

function createStubContext<S>(record: ValidateRecord, plugin: string, subject: S): StubContext<S> {
  return {
    declare: (stub: S, meta?: Meta) => createStubRecorder<S>({ record, plugin }, subject, stub, meta),
    getStub: <A>(subject: A) => getStub<A>(record, subject)
  }
}

type RecorderContext = {
  record: ValidateRecord,
  plugin: string
}

function createStubRecorder<S>(
  { record, plugin }: RecorderContext,
  subject: S,
  stub: S,
  meta: Meta | undefined
): StubRecorder<S> {
  const ref = record.addRef({ plugin, subject, testDouble: stub, meta })

  logCreateStub({ plugin, ref }, subject)

  return {
    stub,
    invoke: (args: any[], options?: StubInvokeOptions) => createInvocationResponder({ record, plugin }, ref, args, options)
  }
}

function createInvocationResponder(
  { record, plugin }: RecorderContext,
  ref: ReferenceId,
  args: any[],
  options: SpyInvokeOptions = {}
): InvocationResponder {
  const action: Omit<InvokeAction, 'tick' | 'mode'> = { type: 'invoke', ref, payload: options.transform ? args.map(options.transform) : args }
  const id = record.addAction(action)

  logInvokeAction({ record, plugin, ref }, id, args)
  return {
    getResult: () => {
      const expected = record.getExpectedAction() as ReturnAction | ThrowAction
      // const actual = { type: 'return' }
      // if (!expected || expected.type !== 'return') throw new ActionMismatch(record.id, actual, expected)


      if (typeof expected.payload !== 'string') {
        return {
          type: expected.type,
          value: expected.payload
        }
      }

      const reference = record.getOriginalRef(expected.payload)!
      // TODO: if there is source, get the value from source.
      // if no source, create imitator.
      if (reference.source || reference.meta === undefined) {
        return {
          type: expected.type,
          value: expected.payload // TODO
        }
      }
      else {
        const plugin = getPlugin(reference.plugin)!
        return {
          type: expected.type,
          value: plugin.createImitator!({}, reference.meta!)
        }
      }
    },
    getResultAsync: () => {
      return Promise.reject('not implemented')
    }
  }
}
