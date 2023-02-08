import type { AsyncContext } from 'async-fp'
import { createSaveSpec } from './createSaveSpec.js'
import { createSimulateSpec } from './createSimulateSpec.js'
import { SpecNotFound } from './errors.js'
import type { Spec } from './types.js'
import type { createSpec } from './types.internal.js'

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
		else throw e
	}
}
