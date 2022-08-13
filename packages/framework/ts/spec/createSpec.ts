import { AsyncContext } from 'async-fp'
import { createAutoSpec } from './createAutoSpec'
import { createLiveSpec } from './createLiveSpec'
import { createSaveSpec } from './createSaveSpec'
import { createSimulateSpec } from './createSimulateSpec'
import { Spec } from './types'
import { MaskCriterion } from './types-internal'

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
