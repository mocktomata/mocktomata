import { findPlugin } from '../plugin';
import { RecordingRecord } from './createRecordingRecord';
import { Meta } from './types';

export type SpyContext = {
  recorder: ReturnType<typeof createPluginRecorder>
}

export function getSpy<T>(record: RecordingRecord, subject: T, isSpecTarget: boolean = false): T {
  const plugin = findPlugin(subject)
  if (!plugin) return subject

  const recorder = createPluginRecorder(record, plugin.name, subject, isSpecTarget)
  return plugin.createSpy({ recorder }, subject)
}

function createPluginRecorder(record: RecordingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
  return {
    declare: (spy: any) => createSubjectRecorder(record, plugin, subject, spy, isSpecTarget),
    getSpy: <T>(subject: T): T => getSpy(record, subject)
  }
}

function createSubjectRecorder(record: RecordingRecord, plugin: string, subject: any, spy: any, isSpecTarget: boolean) {
  record.addRef(isSpecTarget ? { plugin, subject, target: spy, specTarget: true } : { plugin, subject, target: spy })
  const ref = record.getRefId(spy)!

  return {
    instantiate: (args: any[]) => createInstanceRecorder(record, plugin, ref, args),
    invoke: (args: any[]) => createInvocationRecorder(record, plugin, ref, args),
    get: (name: string | number) => createGetterRecorder(record, plugin, ref, name),
    set: (name: string | number, value: any) => createSetterRecorder(record, plugin, ref, name, value)
  }
}

function createInstanceRecorder(record: RecordingRecord, plugin: string, ref: string, args: any[]) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy(record, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction(plugin, { type: 'instantiate', ref, payload })

  return {
    get: (name: string | number) => createGetterRecorder(record, plugin, id, name),
    set: (name: string | number, value: any) => createSetterRecorder(record, plugin, id, name, value)
  }
}

function createInvocationRecorder(record: RecordingRecord, plugin: string, ref: string, args: any[]) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy(record, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction(plugin, { type: 'invoke', ref, payload })

  return {
    returns: (value: any, meta?: Meta) => expressionReturns(record, plugin, id, value, meta),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function createGetterRecorder(record: RecordingRecord, plugin: string, ref: string | number, name: string | number) {
  const id = record.addAction(plugin, { type: 'get', ref, payload: name })

  return {
    returns: (value: any) => expressionReturns(record, plugin, id, value),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function createSetterRecorder(record: RecordingRecord, plugin: string, ref: string | number, name: string | number, value: any) {
  const id = record.addAction(plugin, { type: 'set', ref, payload: [name, value] })

  return {
    returns: (value: any) => expressionReturns(record, plugin, id, value),
    throws: (err: any) => expressionThrows(record, plugin, id, err)
  }
}

function expressionReturns(record: RecordingRecord, plugin: string, id: number, value: any, meta?: Meta) {
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

function expressionThrows(record: RecordingRecord, plugin: string, id: number, err: any) {
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
