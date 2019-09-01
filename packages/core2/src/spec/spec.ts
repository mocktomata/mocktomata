import { context, SpecContext } from '../context';
import { createLiveSpec } from './createLiveSpec';
import { createSaveSpec } from './createSaveSpec';
import { createSimulateSpec } from './createSimulateSpec';
import { SpecIDCannotBeEmpty, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { Spec, CreateSpec, SpecMode, SpecOptions } from './types';

export type SpecObject = CreateSpec & {
  live: CreateSpec,
  save: CreateSpec,
  simulate: CreateSpec,
}

export const spec: SpecObject = Object.assign(
  createSpec('auto'), {
    live: createSpec('live'),
    save: createSpec('save'),
    simulate: createSpec('simulate')
  }
)

export function createSpec(defaultMode: SpecMode): CreateSpec {
  return async (id: string, options: SpecOptions = { timeout: 3000 }) => {
    assertSpecID(id)

    const mode = getEffectiveSpecMode(id, defaultMode)

    const ctx = await context.get()
    switch (mode) {
      case 'auto':
        return createAutoSpec(ctx, id, options)
      case 'live':
        return createLiveSpec()
      case 'save':
        return createSaveSpec(ctx, id, options)
      case 'simulate':
        return createSimulateSpec(ctx, id, options)
    }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new SpecIDCannotBeEmpty()
}

async function createAutoSpec(context: SpecContext, id: string, options: SpecOptions): Promise<Spec> {
  try {
    return await createSimulateSpec(context, id, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, id, options)
    else throw e
  }
}
