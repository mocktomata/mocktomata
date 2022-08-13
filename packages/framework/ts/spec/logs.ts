import { logLevels } from 'standard-log'
import { tersify } from 'tersify'
import { log } from '../log'
import { SpecRecord } from '../spec-record/types'
import { maskIfNeeded } from './masking'
import { prettifyAction } from './prettifyAction'
import { MaskCriterion, Recorder } from './types-internal'

export function logCreateSpy({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, maskCriteria: MaskCriterion[], profile: SpecRecord.SubjectProfile, subject: any) {
  subject = maskIfNeeded(maskCriteria, subject)
  log.on(logLevels.debug, log => log(`${ref.plugin} <ref:${refId}> create ${profile} spy: ${tersify(subject, { maxLength: Infinity })}`))
}

export function logAction(state: Recorder.State, actionId: SpecRecord.ActionId, action: SpecRecord.Action) {
  log.on(logLevels.debug, () => prettifyAction(state, actionId, action))
}

// istanbul ignore next
export function logRecordingTimeout(specName: string, timeout: number) {
  log.warn(`${specName}: done() was not called (in ${timeout} ms). Did the test takes longer than expected or you forget to call done()?`)
}

export function logCreateStub({ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>, profile: SpecRecord.SubjectProfile, subjectOrMeta: any) {
  log.on(logLevels.debug, log => log(`${ref.plugin} <ref:${refId}> create ${profile} stub: ${tersify(subjectOrMeta)}`))
}

// istanbul ignore next
export function logMissingResultAction(state: Recorder.State, actionId: SpecRecord.ActionId, action: SpecRecord.Action) {
  log.error(`Result action for ${prettifyAction(state, actionId, action)} not found.`)
  log.error(`Since all in-between actions should be processed, this is likely some kind of recording error.`)
}
