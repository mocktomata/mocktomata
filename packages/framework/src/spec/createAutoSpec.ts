import { Context } from 'async-fp'
import { createSaveSpec } from './createSaveSpec'
import { createSimulateSpec } from './createSimulateSpec'
import { SpecNotFound } from './errors'
import { Spec, SpecContext, SpecOptions } from './types'

export async function createAutoSpec(context: Context<SpecContext>, title: string, specPath: string, options: SpecOptions): Promise<Spec> {
  try {
    return await createSimulateSpec(context, title, specPath, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, title, specPath, options)
    else throw e
  }
}
