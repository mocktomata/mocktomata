import { tersify } from 'tersify';
import { findPlugin } from '../plugin';
import { log } from '../util';
import { RecordingRecord } from './createRecordingRecord';
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

function createPluginRecorder(record: RecordingRecord, plugin: string, subject: any, isSpecTarget: boolean) {
  return {
    declare: (spy: any) => createSubjectRecorder({ record, plugin }, subject, spy, isSpecTarget),
    getSpy: <T>(subject: T, options?: { isSpecTarget?: boolean }): T => getSpy(
      { record },
      subject,
      options && options.isSpecTarget || isSpecTarget
    )
  }
}

function createSubjectRecorder({ record, plugin }: { record: RecordingRecord; plugin: string; }, subject: any, spy: any, isSpecTarget: boolean) {
  log.onDebug(log => log(`${plugin} spy created for:\n`, tersify(subject)))
  record.addRef(isSpecTarget ? { plugin, subject, target: spy, specTarget: true } : { plugin, subject, target: spy })
  const ref = record.getRefId(spy)!

  return {
    instantiate: (args: any[]) => createInstanceRecorder({ record, plugin, ref }, args),
    invoke: (args: any[]) => createInvocationRecorder({ record, plugin, ref }, args),
    get: (name: string | number) => createGetterRecorder({ record, plugin, ref }, name),
    set: (name: string | number, value: any) => createSetterRecorder({ record, plugin, ref }, name, value)
  }
}

function createInstanceRecorder({ record, plugin, ref }: { record: RecordingRecord; plugin: string; ref: string; }, args: any[]) {
  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction(plugin, { type: 'instantiate', ref, payload })

  return {
    get: (name: string | number) => createGetterRecorder({ record, plugin, ref: id }, name),
    set: (name: string | number, value: any) => createSetterRecorder({ record, plugin, ref: id }, name, value)
  }
}

function createInvocationRecorder({ record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string }, args: any[]) {
  log.onDebug(log => log(`${plugin} invoke with ${tersify(args)} on:\n`, tersify(record.getSubject(ref))))

  const payload: any[] = []
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction(plugin, { type: 'invoke', ref, payload })

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns({ record, plugin, id }, value, options && options.meta),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows({ record, plugin, id }, err, options && options.meta)
  }
}

function createGetterRecorder({ record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string | number }, name: string | number) {
  log.onDebug(log => log(`${plugin} get '${name}' from:\n`, tersify(record.getSubject(ref))))
  const spy = getSpy({ record }, name)
  const payload = record.getRefId(spy) || spy
  const id = record.addAction(plugin, { type: 'get', ref, payload })

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns({ record, plugin, id }, value, options && options.meta),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows({ record, plugin, id }, err, options && options.meta)
  }
}

function createSetterRecorder({ record, plugin, ref }: { record: RecordingRecord, plugin: string, ref: string | number }, name: string | number, value: any) {
  log.onDebug(log => log(`${plugin} set '${name}' with '${value}' to:\n`, tersify(record.getSubject(ref))))
  const id = record.addAction(plugin, { type: 'set', ref, payload: [name, value] })

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns({ record, plugin, id }, value, options && options.meta),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows({ record, plugin, id }, err, options && options.meta)
  }
}

function expressionReturns({ record, plugin, id }: { record: RecordingRecord; plugin: string; id: number; }, value: any, meta?: Meta) {
  const spy = getSpy({ record }, value)
  const payload = record.getRefId(spy) || value
  record.addAction(plugin, { type: 'return', ref: id, payload, meta })
  return spy
}

function expressionThrows({ record, plugin, id }: { record: RecordingRecord; plugin: string; id: number; }, err: any, meta?: Meta) {
  const spy = getSpy({ record }, err)
  const payload = record.getRefId(spy) || err
  record.addAction(plugin, { type: 'throw', ref: id, payload, meta })
  return spy
}
