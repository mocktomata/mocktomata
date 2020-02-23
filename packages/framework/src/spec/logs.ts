import { logLevels } from 'standard-log'
import { tersify } from 'tersify'
import { log } from '../log'
import { SpecRecord } from '../spec-record/types'
import { prettifyAction, prettifyId } from './prettifyAction'
import { Recorder } from './types-internal'


export function logCreateSpy({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SpecRecord.SubjectProfile, subject: any) {
  log.on(logLevels.debug, log => log(`${ref.plugin} <ref:${refId}> create ${profile} spy: ${tersify(subject, { maxLength: Infinity })}`))
}

export function logActionSetMeta({ ref, source }: Recorder.State, meta: any) {
  log.on(logLevels.trace, () => `${ref.plugin} ${prettifyId(source?.id)}> set meta: ${tersify(meta)}`)
}

export function logAction(state: Recorder.State, actionId: SpecRecord.ActionId, action: SpecRecord.Action) {
  log.on(logLevels.debug, () => prettifyAction(state, actionId, action))
}

export function logRecordingTimeout(specName: string, timeout: number) {
  log.warn(`${specName}: done() was not called in ${timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SpecRecord.SubjectProfile, subjectOrMeta: any) {
  log.on(logLevels.debug, log => log(`${ref.plugin} <ref:${refId}> create ${profile} stub: ${tersify(subjectOrMeta)}`))
}

export function logAutoInvokeAction(ref: SpecRecord.Reference, refId: string, actionId: SpecRecord.ActionId, args: any[]) {
  log.on(logLevels.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto invoke with ${tersify(args)}\n${tersify(ref.subject)}`))
}

export function logAutoGetAction(ref: SpecRecord.Reference, refId: string, actionId: SpecRecord.ActionId, name: string | number) {
  log.on(logLevels.debug, log => log(`${ref.plugin} ref/action (${refId}/${actionId}): auto get ${typeof name === 'string' ? `'${name}'` : name}\n${tersify(ref.subject)}`))
}
