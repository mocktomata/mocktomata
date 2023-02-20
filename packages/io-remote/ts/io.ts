import type { Mocktomata } from '@mocktomata/framework'
import fetch from 'cross-fetch'
import { createIOInternal } from './io.internal.js'
import type { IOOptions } from './io.types.js'
import { importModule } from './platform.js'

export async function createIO(options: IOOptions): Promise<Mocktomata.IO> {
	// istanbul ignore next
	return createIOInternal({ fetch, importModule }, options)
}
