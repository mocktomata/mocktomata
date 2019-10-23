import { SpecContext } from '../context'
import { createSaveSpec } from './createSaveSpec'
import { createSimulateSpec } from './createSimulateSpec'
import { SpecNotFound } from './errors'
import { Spec, SpecOptions } from './types'

export async function createAutoSpec(context: SpecContext, title: string, specPath: string, options: SpecOptions): Promise<Spec> {
  try {
    return await createSimulateSpec(context, title, specPath, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, title, specPath, options)
    else throw e
  }
}
