import { getField, pick } from 'type-plus';
import { findPlugin } from '../plugin';
import { ValidatingRecord } from './createValidatingRecord';
import { getSpy } from './getSpy';
import { logCreateStub, logGetAction, logInstantiateAction, logInvokeAction, logReturnAction, logSetAction, logThrowAction } from './log';
import { Meta } from './types';

export type StubRecorder = ReturnType<typeof createPluginReplayer>

export function getStub<T>({ record }: { record: ValidatingRecord }, subject: T, isSpecTarget: boolean = false): T {
  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const player = createPluginReplayer(record, plugin.name, subject, isSpecTarget)
  return plugin.createStub({ recorder: player }, subject, undefined)
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

  logCreateStub({ plugin, ref }, subject)

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
  // const payload = getSpy({ record }, args).map(spy => record.getRefId(spy) || spy)
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction({ type: 'instantiate', ref, payload })

  logInstantiateAction({ record, plugin, ref }, id, args)

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
  const payload = getSpy({ record }, args).map(spy => record.getRefId(spy) || spy)
  const id = record.addAction({ type: 'invoke', ref, payload })
  logInvokeAction({ record, plugin, ref }, id, args)

  // TODO: wait and get result by replayer
  return {
    waitUntilConclude: (cb: () => void) => waitUntilConclude(record, id, cb),
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, ref, id },
      value,
      {}
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, ref, id },
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

  logGetAction({ record, plugin, ref }, id, name)

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, ref, id },
      value,
      {
        isSpecTarget
      },
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, ref, id },
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
  logSetAction({ record, plugin, ref }, id, name, value)

  return {
    getResult: () => getResult(record, id),
    returns: (value: any) => expressionReturns(
      { record, plugin, ref, id },
      value,
      { isSpecTarget },
    ),
    throws: (err: any) => expressionThrows(
      { record, plugin, ref, id },
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
  { record, plugin, ref, id }: { record: ValidatingRecord, plugin: string, ref: string | number, id: number },
  value: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean },
) {
  const spy = getSpy({ record }, value, isSpecTarget)
  const payload = record.getRefId(spy) || value
  const returnId = record.addAction({ type: 'return', ref: id, payload, meta })
  logReturnAction({ plugin, ref }, id, returnId, value)
  return spy
}

function expressionThrows(
  { record, plugin, ref, id }: { record: ValidatingRecord, plugin: string, ref: string | number, id: number },
  err: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean },
) {
  const spy = getSpy({ record }, err, isSpecTarget)
  const payload = record.getRefId(spy) || err
  const throwId = record.addAction({ type: 'throw', ref: id, payload })
  logThrowAction({ plugin, ref }, id, throwId, err)
  return spy
}
