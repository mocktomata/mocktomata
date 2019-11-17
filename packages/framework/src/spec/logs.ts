import { logLevel } from 'standard-log';
import { tersify } from 'tersify';
import { log } from '../log';
import { SpyRecord } from './createSpyRecord';
import { ActionId, ActionMode, ReferenceId, SpecReference, SupportedKeyTypes } from './types';
import { Recorder } from './recorder';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  id: ReferenceId | ActionId;
}

export function logCreateSpy({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, subject: any, mode: ActionMode) {
  log.on(logLevel.debug, log => log(`${plugin} create ${mode} spy (ref:${id}): ${tersify(subject)}`))
}

export function logGetAction({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, actionId: ActionId, property: SupportedKeyTypes, value: any) {
  log.on(logLevel.debug, () => `${plugin} get (act:${actionId}): (ref:${id}).${property} -> ${tersify(value)}`)
}

export function logInvokeAction({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, () => `${plugin} invoke (act:${actionId}): (ref:${id})(${args.map(arg => tersify(arg)).join(',')})`)
}

export function logResultAction({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, type: string, sourceId: ActionId, actionId: ActionId, value: any) {
  log.on(logLevel.debug, () => `${plugin} ${type} (act:${actionId}): (ref:${id} act:${sourceId}) -> ${tersify(value)}`)
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
