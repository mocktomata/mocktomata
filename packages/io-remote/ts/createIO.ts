import type { Mocktomata } from '@mocktomata/framework'
import fetch from 'cross-fetch'
import { createIOInternal } from './createIO.internal.js'
import { importModule } from './platform.js'
import type { CreateIOOptions } from './types.js'

export async function createIO(options?: CreateIOOptions): Promise<Mocktomata.IO> {
  // istanbul ignore next
  return createIOInternal({ fetch, location, importModule }, options)
}
