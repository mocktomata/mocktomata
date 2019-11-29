import { logLevel } from 'standard-log';
import { tersify } from 'tersify';
import { JSONTypes } from 'type-plus';
import { log } from '../log';
import { SpyRecord } from './createSpyRecord';
import { prettifyAction } from './prettifyAction';
import { Recorder } from './recorder';
import { ActionId, ReferenceId, SpecAction, SpecReference, SubjectProfile } from './types';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  id: ReferenceId | ActionId;
}

export function logCreateSpy({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SubjectProfile, subject: any) {
  log.on(logLevel.debug, log => log(`${ref.plugin} create ${profile} spy <ref:${refId}>: ${tersify(subject)}`))
}

export function logAction(state: Pick<Recorder.ActionState, 'ref' | 'actionId'>, actionId: ActionId, action: SpecAction) {
  log.on(logLevel.debug, () => prettifyAction(state, actionId, action))
}

export function logInstantiateAction({ record, plugin, id }: ActionLoggingContext, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${plugin} ref/action (${id}/${actionId}): instantiate with ${tersify(args)}\n${tersify(record.getSubject(id))}`))
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SubjectProfile, meta?: JSONTypes) {
  log.on(logLevel.debug, log => log(`${ref.plugin} create ${profile} stub (ref:${refId})${meta ? `: ${tersify(meta)}` : ''}`))
}

export function logAutoInvokeAction(ref: SpecReference, refId: string, actionId: ActionId, args: any[]) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReference, refId: string, actionId: ActionId, name: string | number) {
  log.on(logLevel.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}
