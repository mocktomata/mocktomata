import type { AsyncContext } from 'async-fp'
import { prettyPrintSpecRecord } from '../spec_record/index.js'
import { assertMockable, assertSpecName } from './asserts.js'
import { toMaskCriterion } from './masking.js'
import { createRecorder } from './recorder.js'
import { isIgnorableValue } from './replay.js'
import type { createSpec } from './types.internal.js'
import type { Spec } from './types.js'

export async function createSaveSpec(
	context: AsyncContext<createSpec.Context>,
	specName: string,
	invokePath: string,
	options: Spec.Options
): Promise<Spec> {
	assertSpecName(specName)

	const recorder = createRecorder(context, specName, options)

	return Object.assign(
		async <S>(subject: S) => {
			assertMockable(subject)
			return recorder.createSpy<S>(subject)
		},
		{
			get mode() {
				return 'save' as const
			},
			async done() {
				recorder.end()
				const { io, maskCriteria, log } = await context.get()
				const record = recorder.getSpecRecord(maskCriteria)
				io.writeSpec(specName, invokePath, record)
				log.debug(`Spec Record "${specName}":`, prettyPrintSpecRecord(record))
				log.trace(`Spec Record "${specName}" written to: ${slash(invokePath)}`)
				return record
			},
			// The options only change how simulation replays the value,
			// so the value is recorded the same way with or without them.
			ignoreMismatch(value: unknown, _options?: Spec.IgnoreMismatchOptions) {
				if (isIgnorableValue(value)) recorder.addInertValue(value)
			},
			maskValue(value: string | RegExp, replaceWithOrOptions?: string | Spec.MaskValueOptions) {
				recorder.addMaskValue(toMaskCriterion(value, replaceWithOrOptions))
			}
		}
	)
}

function slash(value: string) {
	return value.split('\\').join('/')
}
