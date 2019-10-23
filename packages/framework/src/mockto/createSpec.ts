import { context } from '../context'
import { createAutoSpec } from './createAutoSpec'
import { createLiveSpec } from './createLiveSpec'
import { createSaveSpec } from './createSaveSpec'
import { createSimulateSpec } from './createSimulateSpec'
import { Spec, SpecMode, SpecOptions } from './types'

export async function createSpec(specName: string, invokeRelativePath: string, mode: SpecMode, options: SpecOptions): Promise<Spec> {
  const ctx = await context.get()
  switch (mode) {
    case 'auto':
      return createAutoSpec(ctx, specName, invokeRelativePath, options)
    case 'live':
      return createLiveSpec()
    case 'save':
      return createSaveSpec(ctx, specName, invokeRelativePath, options)
    case 'simulate':
      return createSimulateSpec(ctx, specName, invokeRelativePath, options)
  }
}
