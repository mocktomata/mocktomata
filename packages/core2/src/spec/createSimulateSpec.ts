import { Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { getSpy } from './createSaveSpec';
import { createSimulator } from './createSimulator';
import { assertActionType, createValidateRecord, ValidateRecord } from './createValidateRecord';
import { ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { logCreateStub, logInvokeAction, logReturnAction, logThrowAction } from './logs';
import { InvocationResponder, InvokeAction, ReferenceId, ReturnAction, Spec, SpecOptions, StubContext, StubRecorder, ThrowAction } from './types';

export async function createSimulateSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {
  const loaded = await context.io.readSpec(specId)

  const record = createValidateRecord(specId, loaded, options)
  const simulator = createSimulator(record, options)
  record.onAddAction(simulator.run)

  return {
    mock: subject => {
      assertMockable(subject)
      return createStub({ record }, subject)
    },
    async done() { }
  }
}

function createStub<S>({ record }: { record: ValidateRecord }, subject: S): S {
  const plugin = findPlugin(subject)!
  const expectedReference = record.getExpectedReference()
  if (expectedReference.plugin !== plugin.name) {
    throw new ReferenceMismatch(record.specId, { plugin: plugin.name }, expectedReference)
  }

  const context = createStubContext({ record }, plugin.name)
  return plugin.createStub(context, expectedReference.meta)
}

export function createStubContext({ record }: { record: ValidateRecord }, plugin: string): StubContext<any> {
  return {
    declare: <S>(stub: S) => createStubRecorder<S>({ record, plugin }, stub),
    // getStub: <A>(subject: A) => getStub<A>({ record }, subject)
  }
}

// function getStub<S>({ record }: { record: ValidateRecord }, subject: S): S {
//   const stub = record.findTestDouble(subject)
//   if (stub) return stub

//   return createStub({ record }, subject) || subject
// }

type RecorderContext = {
  record: ValidateRecord,
  plugin: string
}

function createStubRecorder<S>(
  { record, plugin }: RecorderContext,
  stub: S
): StubRecorder<S> {
  const ref = record.addRef({ plugin, testDouble: stub })

  logCreateStub({ plugin, ref })

  return {
    stub,
    invoke: (args: any[]) => createInvocationResponder({ record, plugin }, ref, args)
  }
}

function createInvocationResponder(
  { record, plugin }: RecorderContext,
  ref: ReferenceId,
  args: any[]
): InvocationResponder {
  const expected = record.getExpectedAction()
  assertActionType(record.specId, 'invoke', expected)
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

      if (typeof expected.payload !== 'string') {
        return {
          type: expected.type,
          value: expected.payload
        }
      }

      const reference = record.getOriginalRef(expected.payload)!
      const plugin = getPlugin(reference.plugin)!
      const context = createStubContext({ record }, plugin.name)
      return {
        type: expected.type,
        value: plugin.createStub(context, reference.meta)
      }
    },
    getResultAsync: () => {
      return Promise.reject('not implemented')
    },
    returns(value: any) {
      const expected = record.getExpectedAction()
      assertActionType(record.specId, 'return', expected)
      const returnId = record.addAction({ type: 'return', ref: id, payload: value })
      logReturnAction({ plugin, ref }, id, returnId, value)
      return value
    },
    throws(value: any) {
      const expected = record.getExpectedAction()
      assertActionType(record.specId, 'throw', expected)
      const throwId = record.addAction({ type: 'throw', ref: id, payload: value })
      logThrowAction({ plugin, ref }, id, throwId, value)
      return value
    },
  }
}
