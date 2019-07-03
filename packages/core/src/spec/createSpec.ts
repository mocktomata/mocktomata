import { context, SpecContext } from '../context';
import { createSaveSpec } from './createSaveSpec';
import { createSpecPlayer } from './createSpecPlayer';
import { IDCannotBeEmpty, NotSpecable, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { isSpecable } from './isSpecable';
import { Spec, SpecMode, SpecOptions } from './types';

export function createSpec(defaultMode: SpecMode) {
  return async <T>(id: string, subject: T, options = { timeout: 3000 }): Promise<Spec<T>> => {
    const { io } = await context.get()
    assertSpecID(id)

    const mode = getEffectiveSpecMode(id, defaultMode)
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
  if (id === '') throw new IDCannotBeEmpty()
}

export async function createAutoSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  try {
    return await createSimulateSpec(context, id, subject, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) {
      return createSaveSpec(context, id, subject, options)
    }
    else {
      throw e
    }
  }
}

export async function createLiveSpec<T>(_context: SpecContext, _id: string, subject: T, _options: SpecOptions): Promise<Spec<T>> {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  return {
    subject,
    async done() { }
  }
}

export async function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const player = await createSpecPlayer(context, id, subject, options)
  return {
    subject: player.subject,
    async done() {
      return player.end()
    }
  }
}
