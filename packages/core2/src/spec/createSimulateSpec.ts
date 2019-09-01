import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createValidateRecord, ValidateRecord } from './createValidateRecord';
import { findPlugin } from './findPlugin';
import { logCreateStub } from './logs';
import { Meta, Spec, SpecOptions, StubContext, StubRecorder } from './types';

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

function createStubContext(record: ValidateRecord, plugin: string, subject: any): StubContext {
  return {
    declare: (stub: any, meta?: Meta) => createStubRecorder({ record, plugin }, subject, stub, meta),
  }
}

type RecorderContext = {
  record: ValidateRecord,
  plugin: string
}

function createStubRecorder(
  { record, plugin }: RecorderContext,
  subject: any,
  stub: any,
  meta: Meta | undefined
): StubRecorder {
  const ref = record.addRef({ plugin, subject, testDouble: stub, meta })

  logCreateStub({ plugin, ref }, subject)

  return {

  }
}
