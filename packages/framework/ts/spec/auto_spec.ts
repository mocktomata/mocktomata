import type { AsyncContext } from 'async-fp'
import { SpecNotFound } from './errors.js'
import { createSaveSpec } from './save_spec.js'
import { createSimulateSpec } from './simulate_spec.js'
import type { createSpec } from './types.internal.js'
import type { Spec } from './types.js'

export async function createAutoSpec(
	context: AsyncContext<createSpec.Context>,
	specName: string,
	specPath: string,
	options: Spec.Options
): Promise<Spec> {
	try {
		return await createSimulateSpec(context, specName, specPath, options)
	} catch (e: any) {
		// istanbul ignore next
		if (e instanceof SpecNotFound) return createSaveSpec(context, specName, specPath, options)
		throw e
	}
}
