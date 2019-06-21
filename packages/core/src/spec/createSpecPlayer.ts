import { pick } from 'type-plus';
import { SpecContext } from '../context';
import { findPlugin } from '../plugin';
import { createValidatingRecord, ValidatingRecord } from './createValidatingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { Meta, SpecOptions } from './types';
import { log } from '../util';
import { tersify } from 'tersify';

export async function createSpecPlayer<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const actual = await context.io.readSpec(id)
  const record = createValidatingRecord(id, actual, options)
  return {
    subject: getStub(record, subject, true),
    end: async () => record.end(),
  }
}

export type StubContext = {
  player: ReturnType<typeof createPluginReplayer>
}

function getStub<T>(record: ValidatingRecord, subject: T, isSpecTarget: boolean = false): T {
  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const player = createPluginReplayer(record, plugin.name, subject, isSpecTarget)
  return plugin.createStub({ player }, subject)
}

function createPluginReplayer(record: ValidatingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
  return {
    declare: (stub: any) => createSubjectReplayer(record, plugin, subject, stub, isSpecTarget),
    getStub: (subject: any) => getStub(record, subject)
  }
}

function createSubjectReplayer(record: ValidatingRecord, plugin: string, subject: any, stub: any, isSpecTarget: boolean) {
  log.debug(`${plugin} stub created for:\n`, subject)
  record.addRef(isSpecTarget ? { plugin, subject, target: stub, specTarget: true } : { plugin, subject, target: stub })
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
  log.onDebug(log => {
    console.log('reffff', ref)
    log(`${plugin} invoke with ${tersify(args)} on:\n`, record.getSubject(ref))
  })
  const payload: any[] = []
  args.forEach((arg, i) => {
    const stub = args[i] = getSpy(record, arg)
    payload.push(record.getRefId(stub) || stub)
  })
  const id = record.addAction(plugin, { type: 'invoke', ref, payload })
  // TODO: wait and get result by replayer
  return {
    waitUntilConclude: (cb: () => void) => waitUntilConclude(record, id, cb),
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(record, plugin, id, value),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function createGetterReplayer(record: ValidatingRecord, plugin: string, ref: string | number, name: string | number) {
  log.onDebug(log => {
    log(`${plugin} get '${name}' from:\n`, record.getSubject(ref))
  })
  const id = record.addAction(plugin, { type: 'get', ref, payload: name })

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(record, plugin, id, value),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function createSetterReplayer(record: ValidatingRecord, plugin: string, ref: string | number, name: string | number, value: any) {
  log.onDebug(log => {
    log(`${plugin} set '${name}' with '${value}' to:\n`, record.getSubject(ref))
  })
  const id = record.addAction(plugin, { type: 'set', ref, payload: [name, value] })

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(record, plugin, id, value),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function waitUntilConclude(record: ValidatingRecord, id: number, cb: () => void) {

}

function getResult(record: ValidatingRecord, id: number) {
  // record.processUntilConclude(id)
  const action = record.peekAction()!
  return {
    ...pick(action, 'type', 'meta'),
    payload: record.getSubject(action.payload)
  }
}

function expressionReturns(record: ValidatingRecord, plugin: string, id: number, value: any, meta?: Meta) {
  const spy = getSpy(record, value)
  const ref = record.getRefId(spy)
  if (ref) {
    record.addAction(plugin, { type: 'return', ref: id, payload: ref, meta })
  }
  else {
    record.addAction(plugin, { type: 'return', ref: id, payload: value, meta })
  }
  return spy
}

function expressionThrows(record: ValidatingRecord, plugin: string, id: number, err: any) {
  const spy = getSpy(record, err)
  const ref = record.getRefId(spy)
  if (ref) {
    record.addAction(plugin, { type: 'throw', ref: id, payload: ref })
  }
  else {
    record.addAction(plugin, { type: 'throw', ref: id, payload: err })
  }
  return spy
}
