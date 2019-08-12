import { getField } from 'type-plus';
import { findPlugin } from '../plugin';
import { RecordingRecord } from './createRecordingRecord';
import { logCreateSpy, logGetAction, logInstantiateAction, logInvokeAction, logReturnAction, logSetAction, logThrowAction } from './log';
import { Meta, ReturnAction } from './types';

export type SpyRecorder = ReturnType<typeof createSpyRecorder>

export function getSpy<T>({ record }: { record: RecordingRecord }, subject: T, isSpecTarget: boolean = false): T {
  let spy = findCreatedSpy(record, subject)
  if (spy) return spy

  spy = createSpy(record, subject, isSpecTarget)
  if (spy) {
    const reference = record.getRefByTarget(spy)
    reference.source = record.findSourceInfo(subject)
    return spy
  }
  else {
    return subject
  }
}

function findCreatedSpy(record: RecordingRecord, subject: any) {
  return record.findTarget(subject)
}

function createSpy(record: RecordingRecord, subject: any, isSpecTarget: boolean) {
  const plugin = findPlugin(subject)
  if (!plugin) return undefined

  const recorder = createSpyRecorder(record, plugin.name, subject, isSpecTarget)
  return plugin.createSpy({ recorder }, subject)
}

function createSpyRecorder(record: RecordingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
  return {
    declare: (spy: any) => createSubjectRecorder(
      { record, plugin },
      subject,
      spy,
      isSpecTarget),
    getSpy: <T>(subject: T, options?: { isSpecTarget?: boolean }): T => getSpy(
      { record },
      subject,
      getField(options, 'isSpecTarget', isSpecTarget)
    )
  }
}

function createSubjectRecorder(
  { record, plugin }: { record: RecordingRecord; plugin: string; },
  subject: any,
  spy: any,
  isSpecTarget: boolean
) {
  const ref = record.addRef(isSpecTarget ? { plugin, subject, target: spy, specTarget: true } : { plugin, subject, target: spy })

  logCreateSpy({ plugin, ref }, subject)

  return {
    instantiate: (args: any[]) => createInstanceRecorder({ record, plugin, ref }, args),
    invoke: (args: any[]) => createInvocationRecorder({ record, plugin, ref }, args),
    get: (name: string | number) => createGetterRecorder(
      { record, plugin, ref },
      name,
      isSpecTarget,
    ),
    set: (name: string | number, value: any) => createSetterRecorder(
      { record, plugin, ref },
      name,
      value,
      false,
    )
  }
}

function createInstanceRecorder(
  { record, plugin, ref }: { record: RecordingRecord; plugin: string; ref: string; },
  args: any[]
) {
  const payload: any[] = []
  args.forEach(arg => {
    const spy = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction({ type: 'instantiate', ref, payload })
  logInstantiateAction({ record, plugin, ref }, id, args)

  return {
    get: (name: string | number) => createGetterRecorder(
      { record, plugin, ref: id },
      name,
      false
    ),
    set: (name: string | number, value: any) => createSetterRecorder(
      { record, plugin, ref: id },
      name,
      value,
      false,
    )
  }
}

function createInvocationRecorder(
  { record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string },
  args: any[]) {

  const payload: any[] = []
  // TODO: get spy for the whole args array
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction({ type: 'invoke', ref, payload })
  logInvokeAction({ record, plugin, ref }, id, args)

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, ref, id },
      value,
      { meta: getField(options, 'meta') }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, ref, id },
      err,
      { meta: getField(options, 'meta') }
    )
  }
}

function createGetterRecorder(
  { record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string | number },
  name: string | number,
  isSpecTarget: boolean
) {
  const spy = getSpy({ record }, name)
  const payload = record.getRefId(spy) || spy
  const id = record.addAction({ type: 'get', ref, payload })
  logGetAction({ record, plugin, ref }, id, name)

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, ref, id },
      value,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, ref, id },
      err,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    )
  }
}

function createSetterRecorder(
  { record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string | number },
  name: string | number,
  value: any,
  isSpecTarget: boolean,
) {
  const id = record.addAction({ type: 'set', ref, payload: [name, value] })
  logSetAction({ record, plugin, ref }, id, name, value)

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, ref, id },
      value,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, ref, id },
      err,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    )
  }
}

function expressionReturns(
  { record, plugin, ref, id }: { record: RecordingRecord, plugin: string, ref: string | number, id: number; },
  value: any,
  { meta, isSpecTarget = false }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const action: Pick<ReturnAction, 'type' | 'ref' | 'payload' | 'meta'> = { type: 'return', ref: id, payload: undefined, meta }
  const spy = getSpy({ record }, value, isSpecTarget)
  action.payload = record.getRefId(spy) || value
  const returnId = record.addAction(action)
  logReturnAction({ plugin, ref }, id, returnId, value)
  return spy
}

function expressionThrows(
  { record, plugin, ref, id }: { record: RecordingRecord, plugin: string, ref: string | number, id: number; },
  err: any,
  { meta, isSpecTarget = false }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const spy = getSpy({ record }, err, isSpecTarget)
  const payload = record.getRefId(spy) || err
  const throwId = record.addAction({ type: 'throw', ref: id, payload, meta })
  logThrowAction({ plugin, ref }, id, throwId, err)
  return spy
}
