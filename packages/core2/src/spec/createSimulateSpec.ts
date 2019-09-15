import { Omit } from 'type-plus';
import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createContextTracker, ContextTracker } from './createContextTracker';
import { getSpy } from './createSaveSpec';
import { createSimulator } from './createSimulator';
import { assertActionType, createValidateRecord, ValidateRecord } from './createValidateRecord';
import { ReferenceMismatch } from './errors';
import { findPlugin, getPlugin } from './findPlugin';
import { logCreateStub, logInvokeAction, logReturnAction, logThrowAction } from './logs';
import { InvocationResponder, InvokeAction, ReferenceId, ReturnAction, Spec, SpecOptions, SpecReference, StubContext, ThrowAction } from './types';

export async function createSimulateSpec(context: SpecContext, specId: string, options: SpecOptions): Promise<Spec> {
  const loaded = await context.io.readSpec(specId)

  const record = createValidateRecord(specId, loaded, options)
  const contextTracker = createContextTracker()
  const simulator = createSimulator({ record, contextTracker }, options)
  record.onAddAction(simulator.run)

  return {
    mock: subject => {
      assertMockable(subject)
      return createStub({ record, contextTracker }, subject)
    },
    async done() { }
  }
}

export type StubContextInternal = {
  record: ValidateRecord,
  contextTracker: ContextTracker
}

function createStub<S>({ record, contextTracker }: StubContextInternal, subject: S): S {
  const plugin = findPlugin(subject)!
  const expected = record.getExpectedReference()
  if (expected.plugin !== plugin.name) {
    throw new ReferenceMismatch(record.specId, { plugin: plugin.name }, expected)
  }

  const reference: SpecReference = { plugin: plugin.name, subject, mode: expected.mode }
  const ref = record.addRef(reference)
  const context = createStubContext({ record, contextTracker }, plugin.name, ref)
  reference.testDouble = plugin.createStub(context, expected.meta)
  logCreateStub({ plugin: plugin.name, ref })
  return reference.testDouble
}

export function createStubContext({ record, contextTracker }: StubContextInternal, plugin: string, refId: ReferenceId): StubContext<any> {
  return {
    invoke: (args: any[]) => createInvocationResponder({ record, contextTracker }, plugin, refId, args),
    resolve: refOrValue => {
      if (typeof refOrValue !== 'string') return refOrValue

      const reference = record.getRef(refOrValue)
      if (reference) return reference.testDouble

      const origRef = record.getOriginalRef(refOrValue)
      const sourceRef = record.getRef(origRef!.source!.ref)
      const subject = getByPath(sourceRef!.subject, origRef!.source!.site)
      return createStub({ record, contextTracker }, subject)
    }
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

function createInvocationResponder(
  { record, contextTracker }: StubContextInternal,
  plugin: string,
  ref: ReferenceId,
  args: any[]
): InvocationResponder {
  const expected = record.getExpectedAction()
  assertActionType(record.specId, 'invoke', expected)
  const expectedArgs = expected.payload as any[]
  // It is ok if the actual is passing more args than expected.
  const payload = expectedArgs.map((ea, i) => typeof ea === 'string' ? getSpy({ record, contextTracker }, args[i], { mode: 'passive', sourceSite: [i] }) : args[i])
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

      // TODO replace this block by createStub()
      const plugin = getPlugin(expectedReference.plugin)
      const reference: SpecReference = { plugin: plugin.name, mode: expectedReference.mode }
      const ref = record.addRef(reference)
      const context = createStubContext({ record, contextTracker }, plugin.name, ref)
      reference.testDouble = plugin.createStub(context, expectedReference.meta)
      logCreateStub({ plugin: plugin.name, ref })

      return {
        type: expected.type,
        value: reference.testDouble,
        meta: expected.meta,
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
