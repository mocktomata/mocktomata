import { logLevels } from 'standard-log'
import { tersify } from 'tersify'
import type { Log } from '../log/types.js'
import type { SpecRecord } from '../spec_record/types.js'
import { StackFrameContext } from '../stack_frame.types.js'
import { prettifyAction } from './action.format.js'
import { maskString } from './masking.js'
import type { MaskCriterion, Recorder } from './types.internal.js'

export function logCreateSpy(
	{ log, maskCriteria }: Log.Context & { maskCriteria: MaskCriterion[] },
	{ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>,
	profile: SpecRecord.SubjectProfile,
	subject: any
) {
	log.on(logLevels.trace, log =>
		log(
			`${ref.plugin} <ref:${refId}> create ${profile} spy: ${maskString(
				maskCriteria,
				tersify(subject, { maxLength: Infinity })
			)}`
		)
	)
}

export function logAction(
	{ log, stackFrame }: Log.Context & StackFrameContext,
	state: Recorder.State,
	actionId: SpecRecord.ActionId,
	action: SpecRecord.Action
) {
	log.on(logLevels.trace, (log, level) => {
		const msg = prettifyAction(state, actionId, action)
		if (level >= logLevels.planck) {
			log(msg, ...stackFrame.getCallSites(3).map(c => `\n${c.toString()}`))
		} else {
			log(msg)
		}
	})
}

// istanbul ignore next
export function logRecordingTimeout({ log }: Log.Context, specName: string, timeout: number) {
	log.warn(
		`${specName}: done() was not called (in ${timeout} ms). Did the test takes longer than expected or you forget to call done()?`
	)
}

export function logCreateStub(
	{ log, maskCriteria }: Log.Context & { maskCriteria: MaskCriterion[] },
	{ ref, refId }: Pick<Recorder.State, 'ref' | 'refId'>,
	profile: SpecRecord.SubjectProfile,
	subjectOrMeta: any
) {
	log.on(logLevels.trace, log =>
		log(
			`${ref.plugin} <ref:${refId}> create ${profile} stub: ${maskString(
				maskCriteria,
				tersify(subjectOrMeta)
			)}`
		)
	)
}

// istanbul ignore next
export function logMissingResultAction(
	{ log }: Log.Context,
	state: prettifyAction.State,
	actionId: SpecRecord.ActionId,
	action: SpecRecord.Action
) {
	log.error(`Result action for ${prettifyAction(state, actionId, action)} not found.`)
	log.error(`Since all in-between actions should be processed, this is likely some kind of recording error.`)
}

export function logMissingActionAtDone(
	{ log }: Log.Context,
	state: prettifyAction.State,
	specName: string,
	actionId: SpecRecord.ActionId,
	action: SpecRecord.Action
) {
	log.info(`'${specName}' has actions remains when the simulation is done.
This could caused by additional work such as serialization,
or extracting information for recording.

It MIGHT also cause by some unforeseen issues.

Emitting this log so that you are aware of it.
This log might be removed in the future.

The next expecting action is:
${prettifyAction(state, actionId, action)}`)
}
