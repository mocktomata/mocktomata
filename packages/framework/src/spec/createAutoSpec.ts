import { Context } from 'async-fp'
import { createSaveSpec } from './createSaveSpec'
import { createSimulateSpec } from './createSimulateSpec'
import { SpecNotFound } from './errors'
import { Spec } from './types'

export async function createAutoSpec(context: Context<Spec.Context>, title: string, specPath: string, options: Spec.Options): Promise<Spec> {
  try {
    return await createSimulateSpec(context, title, specPath, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, title, specPath, options)
    else throw e
  }
}
