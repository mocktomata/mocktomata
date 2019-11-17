import { logLevel } from 'standard-log';
import { tersify } from 'tersify';
import { log } from '../log';
import { SpyRecord } from './createSpyRecord';
import { prettifyAction } from './prettifyAction';
import { Recorder } from './recorder';
import { ActionId, ActionMode, Meta, ReferenceId, SpecAction, SpecReference } from './types';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  id: ReferenceId | ActionId;
}

export function logCreateSpy({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, mode: ActionMode, subject: any) {
  log.on(logLevel.debug, log => log(`${plugin} create ${mode} spy (ref:${id}): ${tersify(subject)}`))
}

export function logAction(state: Pick<Recorder.State, 'id' | 'plugin'>, actionId: ActionId, action: SpecAction) {
  log.on(logLevel.debug, () => prettifyAction(state, actionId, action))
}

export function logInstantiateAction({ record, plugin, id }: ActionLoggingContext, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ref/action (${id}/${actionId}): instantiate with ${tersify(args)}\n${tersify(record.getSubject(id))}`))
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ plugin, id }: Pick<Recorder.State, 'id' | 'plugin'>, mode: ActionMode, meta?: Meta) {
  log.on(logLevel.debug, log => log(`${plugin} create ${mode} stub (ref:${id})${meta ? `: ${tersify(meta)}` : ''}`))
}

export function logAutoInvokeAction(ref: SpecReference, refId: string, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReference, refId: string, actionId: ActionId, name: string | number) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}
