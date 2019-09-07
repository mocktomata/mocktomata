import { Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createSimulator } from './createSimulator';
import { assertActionType, createValidateRecord, ValidateRecord } from './createValidateRecord';
import { findPlugin, getPlugin } from './findPlugin';
import { logCreateStub, logInvokeAction } from './logs';
import { InvocationResponder, InvokeAction, Meta, ReferenceId, ReturnAction, Spec, SpecOptions, SpyInvokeOptions, StubContext, StubInvokeOptions, StubRecorder, ThrowAction } from './types';
import { getSpy } from './createSaveSpec';

export async function createSimulateSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {
  const loaded = await context.io.readSpec(specId)

  const record = createValidateRecord(specId, loaded, options)
  const simulator = createSimulator(record, options)
  record.onAddAction(simulator.run)

  return {
    mock: subject => {
      assertMockable(subject)
      return getStub({ specId, record }, subject)
    },
    async done() { }
  }
}

function getStub<S>({ specId, record }: { specId: string, record: ValidateRecord }, subject: S): S {
  const stub = record.findTestDouble(subject)
  if (stub) return stub

  return createStub({ specId, record }, subject) || subject
}

function createStub<S>({ specId, record }: { specId: string, record: ValidateRecord }, subject: S): S | undefined {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const context = createStubContext({ specId, record }, plugin.name, subject)
  return plugin.createStub(context, subject)
}

function createStubContext<S>({ specId, record }: { specId: string, record: ValidateRecord }, plugin: string, subject: S): StubContext<S> {
  return {
    declare: (stub: S, meta?: Meta) => createStubRecorder<S>({ specId, record, plugin }, subject, stub, meta),
    getStub: <A>(subject: A) => {
      return getStub<A>({ specId, record }, subject)
    }
  }
}

type RecorderContext = {
  specId: string,
  record: ValidateRecord,
  plugin: string
}

function createStubRecorder<S>(
  { specId, record, plugin }: RecorderContext,
  subject: S,
  stub: S,
  meta: Meta | undefined
): StubRecorder<S> {
  const ref = record.addRef({ plugin, subject, testDouble: stub, meta })

  logCreateStub({ plugin, ref }, subject)

  return {
    stub,
    invoke: (args: any[]) => createInvocationResponder({ specId, record, plugin }, ref, args)
  }
}

function createInvocationResponder(
  { specId, record, plugin }: RecorderContext,
  ref: ReferenceId,
  args: any[]
): InvocationResponder {
  const expected = record.getExpectedAction()
  assertActionType(specId, 'invoke', expected)
  const expectedArgs = expected.payload as any[]
  // It is ok if the actual is passing more args than expected.
  const payload = expectedArgs.map((ea, i) => typeof ea === 'string' ? getSpy({ record }, args[i], { mode: 'passive' }) : args[i])
  const action: Omit<InvokeAction, 'tick' | 'mode'> = {
    type: 'invoke',
    ref,
    payload
  }
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
