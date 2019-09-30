import { logLevel } from 'standard-log';
import { tersify } from 'tersify';
import { log } from '../log';
import { SpyRecord } from './createSpyRecord';
import { SpecReference, ActionId, ReferenceId } from './types';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  id: ReferenceId | ActionId;
}

export function logCreateSpy({ plugin, id }: Omit<ActionLoggingContext, 'record'>, subject: any) {
  log.on(logLevel.debug, log => log(`${plugin} ${id}: create spy\n${tersify(subject)}`))
}

export function logInvokeAction({ record, plugin, id }: ActionLoggingContext, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ref/action (${id}/${actionId}): invoke with ${tersify(args)}\n${tersify(record.getSubject(id))}`))
}

export function logResultAction({ plugin, id }: Omit<ActionLoggingContext, 'record'>, type: string, sourceId: ActionId, actionId: ActionId, value: any) {
  log.on(logLevel.debug, () => `${plugin} ref/src-action/action (${id}/${sourceId}/${actionId}): ${type} ${tersify(value)}`)
}

export function logInstantiateAction({ record, plugin, id }: ActionLoggingContext, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ref/action (${id}/${actionId}): instantiate with ${tersify(args)}\n${tersify(record.getSubject(id))}`))
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ plugin, id }: Omit<ActionLoggingContext, 'record'>) {
  log.on(logLevel.debug, log => log(`${plugin} ${id}: create stub`))
}

export function logAutoInvokeAction(ref: SpecReference, refId: string, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReference, refId: string, actionId: ActionId, name: string | number) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}
