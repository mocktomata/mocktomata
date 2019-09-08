import { logLevel } from 'standard-log';
import { tersify } from 'tersify';
import { log } from '../log';
import { SpyRecord } from './createSpyRecord';
import { SpecReference } from './types';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  ref: string | number;
}

export function logCreateSpy({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, subject: any) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}: create spy\n${tersify(subject)}`))
}

export function logInvokeAction({ record, plugin, ref }: ActionLoggingContext, id: number, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ref/action (${ref}/${id}): invoke with ${tersify(args)}\n${tersify(record.getSubject(ref))}`))
}

export function logReturnAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.on(logLevel.debug, () => `${plugin} ref/src-action/action (${ref}/${sourceId}/${id}): returns ${tersify(value)}`)
}

export function logThrowAction({ plugin, ref }: Omit<ActionLoggingContext, 'record'>, sourceId: number, id: number, value: any) {
  log.on(logLevel.debug, () => `${plugin} ref/src-action/action (${ref}/${sourceId}/${id}): throws ${tersify(value)}`)
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ plugin, ref }: Omit<ActionLoggingContext, 'record'>) {
  log.on(logLevel.debug, log => log(`${plugin} ${ref}: create stub`))
}

export function logAutoInvokeAction(ref: SpecReference, refId: string, id: number, args: any[]) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${id}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReference, refId: string, id: number, name: string | number) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${id}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}
