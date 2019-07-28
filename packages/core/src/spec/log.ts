import { tersify } from 'tersify';
import { log } from '../util';
import { RecordingRecord } from './createRecordingRecord';
import { SpecReferenceLive } from './typesInternal';
import { logLevel } from 'standard-log';

export type ActionLoggingContext = {
  record: Pick<RecordingRecord, 'getSubject'>;
  plugin: string;
  ref: string | number;
}

export function logCreateSpy({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, subject: any) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}: create spy\n${tersify(subject)}`))
}

export function logCreateStub({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, subject: any) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}: create stub\n${tersify(subject)}`))
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logInstantiateAction({ record, plugin, ref }: ActionLoggingContext, id: number, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref} /${id}: instantiate with ${tersify(args)}\n${tersify(record.getSubject(ref))}`));
}

export function logInvokeAction({ record, plugin, ref }: ActionLoggingContext, id: number, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}/${id}: invoke with ${tersify(args)}\n${tersify(record.getSubject(ref))}`))
}

export function logGetAction({ record, plugin, ref }: ActionLoggingContext, id: number, name: string | number) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}/${id}: get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(record.getSubject(ref))}`))
}

export function logSetAction({ record, plugin, ref }: ActionLoggingContext, id: number, name: string | number, value: any) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}/${id}: set ${typeof name === 'string' ? `'${name}'` : name} with ${value}\n${tersify(record.getSubject(ref))}`))
}

export function logReturnAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.on(logLevel.debug, () => `${plugin} ${ref}/${sourceId}/${id}: returns ${value}`)
}

export function logThrowAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.on(logLevel.debug, () => `${plugin} ${ref}/${sourceId}/${id}: throws ${value}`)
}

export function logAutoInvokeAction(ref: SpecReferenceLive, refId: string, id: number, args: any[]) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ${refId}/${id}: auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReferenceLive, refId: string, id: number, name: string | number) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ${refId}/${id}: auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}