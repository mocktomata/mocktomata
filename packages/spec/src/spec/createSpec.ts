import { context } from '../context';
import { createLiveSpec } from './capture';
import { IDCannotBeEmpty } from './errors';
// import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { Spec, SpecMode } from './types';

export function createSpec(defaultMode: SpecMode) {
  return async <T>(id: string, subject: T, options = { timeout: 3000 }): Promise<Spec<T>> => {
    const { io, log } = await context.get()
    assertSpecID(id)

    return createLiveSpec({ io, log }, id, subject, options)

    // const mode = getEffectiveSpecMode(id, defaultMode)
    // switch (mode) {
    //   case 'live':
    //     return createLiveSpec({ io, log }, id, subject, options)
      // case 'save':
      //   return createSaveSpec({ io, log }, id, subject, options)
      // case 'simulate':
      //   return createSaveSpec({ io, log }, id, subject, options)
      // return createSimulateSpec({ io }, id, subject)
    // }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new IDCannotBeEmpty()
}
