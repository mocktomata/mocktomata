import { tersify } from 'tersify';
import { getField } from 'type-plus';
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
  record.addRef(isSpecTarget ? { plugin, subject, target: spy, specTarget: true } : { plugin, subject, target: spy })
  const ref = record.getRefId(spy)!

  log.onDebug(log => log(`${plugin} [${ref}] spy created for:\n`, tersify(subject)))
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
  args.forEach((arg, i) => {
    const spy = args[i] = getSpy({ record }, arg)
    payload.push(record.getRefId(spy) || spy)
  })
  const id = record.addAction({ type: 'instantiate', ref, payload })

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

  log.onDebug(log => log(`${plugin} [${id}] invoke with ${tersify(args)} on:\n`, tersify(record.getSubject(ref))))

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, id },
      value,
      { meta: getField(options, 'meta') }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, id },
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
  log.onDebug(log => log(`${plugin} [${id}] get '${name}' from:\n`, tersify(record.getSubject(ref))))

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, id },
      value,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, id },
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
  log.onDebug(log => log(`${plugin} [${id}] set '${name}' with '${value}' to:\n`, tersify(record.getSubject(ref))))

  return {
    returns: (value: any, options?: { meta?: Meta }) => expressionReturns(
      { record, plugin, id },
      value,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    ),
    throws: (err: any, options?: { meta?: Meta }) => expressionThrows(
      { record, plugin, id },
      err,
      {
        meta: getField(options, 'meta'),
        isSpecTarget
      }
    )
  }
}

function expressionReturns(
  { record, plugin, id }: { record: RecordingRecord; plugin: string; id: number; },
  value: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const spy = getSpy({ record }, value, isSpecTarget)
  log.onDebug(() => `${plugin} [${id}] returns ${spy}`)
  const payload = record.getRefId(spy) || value
  record.addAction({ type: 'return', ref: id, payload, meta })
  return spy
}

function expressionThrows(
  { record, plugin, id }: { record: RecordingRecord; plugin: string; id: number; },
  err: any,
  { meta, isSpecTarget }: { meta?: Meta, isSpecTarget?: boolean }
) {
  const spy = getSpy({ record }, err, isSpecTarget)
  log.onDebug(() => `${plugin} [${id}] throws ${spy}`)
  const payload = record.getRefId(spy) || err
  record.addAction({ type: 'throw', ref: id, payload, meta })
  return spy
}
