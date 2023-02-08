import type { AsyncContext } from 'async-fp'
import { createAutoSpec } from './createAutoSpec.js'
import { createLiveSpec } from './createLiveSpec.js'
import { createMockSpec } from './createMockSpec.js'
import { createSaveSpec } from './createSaveSpec.js'
import { createSimulateSpec } from './createSimulateSpec.js'
import type { MaskCriterion } from './types.internal.js'
import type { Spec } from './types.js'

export async function createSpec(
	context: AsyncContext<Spec.Context>,
	specName: string,
	invokeRelativePath: string,
	mode: Spec.Mode,
	options: Spec.Options
): Promise<Spec> {
	const ctx = context.extend({ maskCriteria: [] as MaskCriterion[] })
	switch (mode) {
		case 'auto':
			return createAutoSpec(ctx, specName, invokeRelativePath, options)
		case 'live':
			return createLiveSpec()
		case 'save':
			return createSaveSpec(ctx, specName, invokeRelativePath, options)
		case 'simulate':
			return createSimulateSpec(ctx, specName, invokeRelativePath, options)
		case 'mock':
			return createMockSpec()
		// istanbul ignore next
		default:
			throw new Error(`Unknown mode: ${mode}`)
	}
}
