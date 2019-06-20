import { SpecContext } from '../context';
import { findPlugin } from '../plugin';
import { createValidatingRecord, ValidatingRecord } from './createValidatingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { SpecOptions } from './types';
import { pick } from 'type-plus';
import { isSpecable } from './isSpecable';

export async function createSpecSimulator<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const actual = await context.io.readSpec(id)
  const record = createValidatingRecord(id, actual, options)
  return {
    subject: getStub(record, subject),
    end: async () => record.end(),
  }
}

export type StubContext = {
  player: ReturnType<typeof createPluginReplayer>
}

function getStub<T>(record: ValidatingRecord, subject: T): T {
  const plugin = findPlugin(subject)
  if (!plugin) throw new NotSpecable(subject)

  const player = createPluginReplayer(record, plugin.name, subject)
  return plugin.createStub({ player }, subject)
}

function createPluginReplayer(record: ValidatingRecord, plugin: string, subject: any) {
  return {
    declare: (stub: any) => createSubjectReplayer(record, plugin, subject, stub),
    getStub: (subject: any) => getStub(record, subject)
  }
}

function createSubjectReplayer(record: ValidatingRecord, plugin: string, subject: any, stub: any) {
  record.addRef({ plugin, subject, target: stub })
  const ref = record.getRefId(stub)!

  return {
    instantiate: (args: any[]) => createInstanceReplayer(record, plugin, ref, args),
    invoke: (args: any[]) => createInvocationReplayer(record, plugin, ref, args),
    get: (name: string | number) => createGetterReplayer(record, plugin, ref, name),
    set: (name: string | number, value: any) => createSetterReplayer(record, plugin, ref, name, value)
  }
}

function createInstanceReplayer(record: ValidatingRecord, plugin: string, ref: string, args: any[]) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy(record, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction(plugin, { type: 'instantiate', ref, payload })

  return {
    get: (name: string | number) => createGetterReplayer(record, plugin, id, name),
    set: (name: string | number, value: any) => createSetterReplayer(record, plugin, id, name, value)
  }
}

function createInvocationReplayer(record: ValidatingRecord, plugin: string, ref: string, args: any[]) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const stub = args[i] = getStub(record, arg)
    payload.push(record.getRefId(stub) || stub)
  })
  const id = record.addAction(plugin, { type: 'invoke', ref, payload })
  // TODO: wait and get result by replayer
  return {
    waitUntilConclude: (cb: () => void) => waitUntilConclude(record, id, cb),
    getResult: () => getResult(record, id)
  }
}

function createGetterReplayer(record: ValidatingRecord, plugin: string, ref: string | number, name: string | number) {
  const id = record.addAction(plugin, { type: 'get', ref, payload: name })

  return {
    getResult: () => getResult(record, id)
  }
}

function createSetterReplayer(record: ValidatingRecord, plugin: string, ref: string | number, name: string | number, value: any) {
  const id = record.addAction(plugin, { type: 'set', ref, payload: [name, value] })

  return {
    getResult: () => getResult(record, id)
  }
}

function waitUntilConclude(record: ValidatingRecord, id: number, cb: () => void) {

}

function getResult(record: ValidatingRecord, id: number) {
  // record.processUntilConclude(id)
  const action = record.peekAction()
  return pick(action, 'type', 'payload', 'meta')
}
