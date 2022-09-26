import { AsyncContext } from 'async-fp'
import { createAutoSpec } from './createAutoSpec.js'
import { createLiveSpec } from './createLiveSpec.js'
import { createSaveSpec } from './createSaveSpec.js'
import { createSimulateSpec } from './createSimulateSpec.js'
import { Spec } from './types.js'
import { MaskCriterion } from './types.internal.js'

export async function createSpec(context: AsyncContext<Spec.Context>, specName: string, invokeRelativePath: string, mode: Spec.Mode, options: Spec.Options): Promise<Spec> {
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
  }
}
