import { logLevels } from 'standard-log';
import { tersify } from 'tersify';
import { JSONTypes, RequiredPick } from 'type-plus';
import { log } from '../log';
import { prettifyAction } from './prettifyAction';
import { Recorder } from './recorder';
import { SpecRecord } from './types';

export type ActionLoggingContext = {
  record: Pick<SpyRecord, 'getSubject'>,
  plugin: string,
  id: SpecRecord.ReferenceId | SpecRecord.ActionId;
}

export function logCreateSpy({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SpecRecord.SubjectProfile, subject: any) {
  log.on(logLevels.debug, log => log(`${ref.plugin} <ref:${refId}> create ${profile} spy: ${tersify(subject)}`))
}

export function logActionSetMeta({ ref, actionId }: Pick<Recorder.ActionState, 'ref' | 'actionId'>, meta: any) {
  log.on(logLevels.trace, () => `${ref.plugin} <act:${actionId}> set meta: ${tersify(meta)}`)
}

export function logGetAction({ ref, refId, actionId, site }: RequiredPick<Recorder.ActionState, 'site'>, performer: SpecRecord.Performer) {
  log.on(logLevels.debug, log => log(`${ref.plugin} <act:${actionId}> ${prettifyPerformer(performer)} access <ref:${refId}>.${site.join('.')}`))
}

export function logReturnAction(state: Pick<Recorder.ActionState, 'ref' | 'refId' | 'actionId'>, actionId: SpecRecord.ActionId, payload: any) {
  log.on(logLevels.debug, log => log(`${state.ref.plugin} <act:${actionId}> <ref:${state.refId} act:${state.actionId}> -> ${typeof payload === 'string' ? `<ref:${payload}>` : tersify(payload)}`))
}

export function logThrowsAction(state: Pick<Recorder.ActionState, 'ref' | 'refId' | 'actionId'>, actionId: SpecRecord.ActionId, payload: any) {
  log.on(logLevels.debug, log => log(`${state.ref.plugin} <act:${actionId}> <ref:${state.refId} act:${state.actionId}> throws ${typeof payload === 'string' ? `<ref:${payload}>` : tersify(payload)}`))
}

export function logAction(state: Pick<Recorder.ActionState, 'ref' | 'actionId'>, actionId: ActionId, action: SpecAction) {
  log.on(logLevels.debug, () => prettifyAction(state, actionId, action))
}

export function logInstantiateAction({ record, plugin, id }: ActionLoggingContext, actionId: ActionId, args: any[]) {
  log.on(logLevels.debug, log => log(`${plugin} ref/action (${id}/${actionId}): instantiate with ${tersify(args)}\n${tersify(record.getSubject(id))}`))
}

export function logRecordingTimeout(timeout: number) {
  log.warn(`done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SubjectProfile, meta?: JSONTypes) {
  log.on(logLevels.debug, log => log(`${ref.plugin} create ${profile} stub <ref:${refId}>${meta ? `: ${tersify(meta)}` : ''}`))
}

export function logAutoInvokeAction(ref: SpecReference, refId: string, actionId: ActionId, args: any[]) {
  log.on(logLevels.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecReference, refId: string, actionId: ActionId, name: string | number) {
  log.on(logLevels.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}

function prettifyPerformer(performer: SpecRecord.Performer) {
  switch (performer) {
    case 'user': return 'you'
    case 'mockto': return 'I'
    default: return performer
  }
}
