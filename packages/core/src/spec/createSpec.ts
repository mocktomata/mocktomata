import { context } from './context';
import { IDCannotBeEmpty } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { Spec, SpecMode } from './interfaces';
// import { createSimulateSpec } from './simulate';
import { createLiveSpec, createSaveSpec } from './spy';

export function createSpec(defaultMode: SpecMode) {
  return async <T>(id: string, subject: T, options = { timeout: 3000 }): Promise<Spec<T>> => {
    const { io, log } = await context.get()
    assertSpecID(id)

    const mode = getEffectiveSpecMode(id, defaultMode)
    switch (mode) {
      case 'live':
        return createLiveSpec(subject)
      case 'save':
        return createSaveSpec({ io, log }, id, subject, options)
      case 'simulate':
        return createSaveSpec({ io, log }, id, subject, options)
        // return createSimulateSpec({ io }, id, subject)
    }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new IDCannotBeEmpty()
}
