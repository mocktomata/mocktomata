import { tersify } from 'tersify';
import { getField, pick } from 'type-plus';
import { SpecContext } from '../context';
import { findPlugin } from '../plugin';
import { log } from '../util';
import { createValidatingRecord, ValidatingRecord } from './createValidatingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { Meta, SpecOptions } from './types';

export async function createSpecPlayer<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const loaded = await context.io.readSpec(id)
  const record = createValidatingRecord(id, loaded, options)
  return {
    subject: getStub({ record }, subject, true),
    end: async () => record.end(),
  }
}

export type StubContext = {
  player: ReturnType<typeof createPluginReplayer>
}

function getStub<T>({ record }: { record: ValidatingRecord }, subject: T, isSpecTarget: boolean = false): T {
  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const player = createPluginReplayer(record, plugin.name, subject, isSpecTarget)
  return plugin.createStub({ player }, subject)
}

export function createPluginReplayer(record: ValidatingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
  return {
    declare: () => createSubjectReplayer(
      { record, plugin },
      subject,
      isSpecTarget),
    getSpy: (subject: any, options?: { isSpecTarget?: boolean }) => getSpy(
      { record },
      subject,
      getField(options, 'isSpecTarget', isSpecTarget)
    ),
    getStub: (subject: any) => getStub({ record }, subject)
  }
}

function createSubjectReplayer(
  { record, plugin }: { record: ValidatingRecord, plugin: string },
  subject: any,
  isSpecTarget: boolean) {

  const specRef = isSpecTarget ? { plugin, subject, target: undefined, specTarget: true } : { plugin, subject, target: undefined }
  const ref = record.addRef(specRef)

  log.onDebug(log => log(`${plugin} stub [${ref}] created for:\n`, tersify(subject)))

  return {
    instantiate: (args: any[]) => createInstanceReplayer({ record, plugin, ref }, args),
    invoke: (args: any[]) => createInvocationReplayer({ record, plugin, ref }, args),
    get: (name: string | number) => createGetterReplayer(
      { record, plugin, ref },
      name,
      isSpecTarget,
    ),
    set: (name: string | number, value: any) => createSetterReplayer(
      { record, plugin, ref },
      name,
      value,
      false
    ),
    setTarget: (target: any) => specRef.target = target
  }
}

function createInstanceReplayer(
  { record, plugin, ref }: { record: ValidatingRecord; plugin: string; ref: string },
  args: any[]
) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction({ type: 'instantiate', ref, payload })

  log.onDebug(log => log(`${plugin} [${ref}] instantiate with ${tersify(args)} on:\n`, tersify(record.getSubject(ref))))

  return {
    get: (name: string | number) => createGetterReplayer(
      { record, plugin, ref: id },
      name,
      false,
    ),
    set: (name: string | number, value: any) => createSetterReplayer(
      { record, plugin, ref: id },
      name,
      value,
      false,
    )
  }
}

function createInvocationReplayer({ record, plugin, ref }: { record: ValidatingRecord; plugin: string; ref: string }, args: any[]) {
  log.onDebug(log => log(`${plugin} [${ref}] invoke with ${tersify(args)} on:\n`, tersify(record.getSubject(ref))))
  const payload: any[] = []
  args.forEach((arg, i) => {
    const stub = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(stub) || stub)
  })
  const id = record.addAction({ type: 'invoke', ref, payload })
  // TODO: wait and get result by replayer
  return {
    waitUntilConclude: (cb: () => void) => waitUntilConclude(record, id, cb),
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, id },
      value,
      {}
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, id },
      err,
      {})
  }
}

function createGetterReplayer(
  { record, plugin, ref }: { record: ValidatingRecord; plugin: string; ref: string | number },
  name: string | number,
  isSpecTarget: boolean,
) {
  const spy = getSpy({ record }, name)
  const payload = record.getRefId(spy) || spy
  const id = record.addAction({ type: 'get', ref, payload })

  log.onDebug(log => log(`${plugin} [${ref}][${id}] get '${name}' from:\n`, tersify(record.getSubject(ref))))

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, id },
      value,
      {
        isSpecTarget
      },
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, id },
      err,
      { isSpecTarget },
    )
  }
}

function createSetterReplayer(
  { record, plugin, ref }: { record: ValidatingRecord; plugin: string; ref: string | number },
  name: string | number,
  value: any,
  isSpecTarget: boolean,
) {
  const id = record.addAction({ type: 'set', ref, payload: [name, value] })
  log.onDebug(log => log(`${plugin} [${ref}][${id}] set '${name}' with '${value}' to:\n`, tersify(record.getSubject(ref))))

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, id },
      value,
      { isSpecTarget },
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, id },
      err,
      { isSpecTarget },
    )
  }
}

function waitUntilConclude(record: ValidatingRecord, id: number, cb: () => void) {
  record.onAction(id, cb)
}

function getResult(record: ValidatingRecord, id: number) {
  // record.processUntilConclude(id)
  const action = record.peekAction()!
  return {
    ...pick(action, 'type', 'meta'),
    payload: record.getSubject(action.payload)
  }
}

function expressionReturns(
  { record, plugin, id }: { record: ValidatingRecord; plugin: string; id: number },
  value: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean },
) {
  const spy = getSpy({ record }, value, isSpecTarget)
  log.onDebug(() => `${plugin} [${id}] returns ${spy}`)
  const payload = record.getRefId(spy) || value
  record.addAction({ type: 'return', ref: id, payload, meta })
  return spy
}

function expressionThrows(
  { record, plugin, id }: { record: ValidatingRecord; plugin: string; id: number },
  err: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean },
) {
  const spy = getSpy({ record }, err, isSpecTarget)
  log.onDebug(() => `${plugin} [${id}] throws ${spy}`)
  const payload = record.getRefId(spy) || err
  record.addAction({ type: 'throw', ref: id, payload })
  return spy
}
