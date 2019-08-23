import { context, SpecContext } from '../context';
import { createLiveSpec } from './createLiveSpec';
import { SpecIDCannotBeEmpty, SpecNotFound, NotSpecable } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { Spec, SpecMode, SpecOptions } from './types';
import { createSimulateSpec } from './createSimulateSpec';
import { createSaveSpec } from './createSaveSpec';
import { isSpecable } from './isSpecable';

export type SpecFunction = <T>(id: string, subject: T, options?: SpecOptions) => Promise<Spec<T>>

export type SpecObject = SpecFunction & {
  live: SpecFunction,
  save: SpecFunction,
  simulate: SpecFunction,
}

export const spec: SpecObject = Object.assign(
  createSpec('auto'), {
    live: createSpec('live'),
    save: createSpec('save'),
    simulate: createSpec('simulate')
  }
)

export function createSpec(defaultMode: SpecMode): SpecFunction {
  return async (id: string, subject: any, options = { timeout: 3000 }) => {
    assertSpecID(id)
  if (!isSpecable(subject)) throw new NotSpecable(subject)

    const mode = getEffectiveSpecMode(id, defaultMode)

    const { io } = await context.get()
    switch (mode) {
      case 'auto':
        return createAutoSpec({ io }, id, subject, options)
      case 'live':
        return createLiveSpec({ io }, id, subject, options)
      case 'save':
        return createSaveSpec({ io }, id, subject, options)
      case 'simulate':
        return createSimulateSpec({ io }, id, subject, options)
    }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new SpecIDCannotBeEmpty()
}

async function createAutoSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  try {
    return await createSimulateSpec(context, id, subject, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound)
      return createSaveSpec(context, id, subject, options)
    else
      throw e
  }
}
