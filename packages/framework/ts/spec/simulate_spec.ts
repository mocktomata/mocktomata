import type { AsyncContext } from 'async-fp'
import { prettyPrintSpecRecord } from '../spec_record/index.js'
import { assertMockable } from './asserts.js'
import { assertSpecName } from './asserts.js'
import { createSimulator } from './simulator.js'
import { createSpec } from './types.internal.js'
import { Spec } from './types.js'

export async function createSimulateSpec(
	context: AsyncContext<createSpec.Context>,
	specName: string,
	invokePath: string,
	options: Spec.Options
): Promise<Spec> {
	assertSpecName(specName)
	const { io, log } = await context.get()
	const loaded = await io.readSpec(specName, invokePath)
	const simulator = createSimulator(context, specName, loaded, options)
	let starting = true
	return Object.assign(
		async <S>(subject: S) => {
			assertMockable(subject)
			if (starting) {
				log.debug(`Simulating Spec Record "${specName}":`, prettyPrintSpecRecord(loaded))
				starting = false
			}
			return simulator.createStub<S>(subject)
		},
		{
			get mode() {
				return 'simulate' as const
			},
			async done() {
				simulator.end()
				return loaded
			},
			ignoreMismatch() {},
			maskValue(value: string, replaceWith?: string) {
				simulator.addMaskValue(value, replaceWith)
			}
		}
	)
}
