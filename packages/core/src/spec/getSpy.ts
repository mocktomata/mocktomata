import { getField } from 'type-plus';
import { findPlugin } from '../plugin';
import { RecordingRecord } from './createRecordingRecord';
import { logCreateSpy, logGetAction, logInstantiateAction, logInvokeAction, logReturnAction, logSetAction, logThrowAction } from './log';
import { Meta } from './types';

export type SpyContext = {
  recorder: ReturnType<typeof createPluginRecorder>
}

export function getSpy<T>({ record }: { record: RecordingRecord }, subject: T, isSpecTarget: boolean = false): T {
  const spy = record.findTarget(subject)
  if (spy) return spy

  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const recorder = createPluginRecorder(record, plugin.name, subject, isSpecTarget)
  return plugin.createSpy({ recorder }, subject)
}

export function getSpies({ record }: { record: RecordingRecord }, subjects: any[]) {
  return subjects.map(s => getSpy({ record }, s))
}

export function createPluginRecorder(record: RecordingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
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

function createSubjectRecorder({ record, plugin }: { record: RecordingRecord; plugin: string; }, subject: any, spy: any, isSpecTarget: boolean) {
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

function createInstanceRecorder({ record, plugin, ref }: { record: RecordingRecord; plugin: string; ref: string; }, args: any[]) {
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
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const spy = getSpy({ record }, value, isSpecTarget)
  const payload = record.getRefId(spy) || value
  const returnId = record.addAction({ type: 'return', ref: id, payload, meta })
  logReturnAction({ plugin, ref }, id, returnId, value)
  return spy
}

function expressionThrows(
  { record, plugin, ref, id }: { record: RecordingRecord, plugin: string, ref: string | number, id: number; },
  err: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const spy = getSpy({ record }, err, isSpecTarget)
  const payload = record.getRefId(spy) || err
  const throwId = record.addAction({ type: 'throw', ref: id, payload, meta })
  logThrowAction({ plugin, ref }, id, throwId, err)
  return spy
}
