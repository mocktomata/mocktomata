import { context } from '../context';
import { IDCannotBeEmpty, SpecNotFound } from '../errors';
import { CaptureContext } from '../types';
import { createActionPlayer } from './ActionPlayer';
import { createActionRecorder } from './ActionRecorder';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
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

export async function createAutoSpec<T>(context: CaptureContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
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

export async function createLiveSpec<T>(context: CaptureContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const recorder = createActionRecorder(context, id, subject, options)
  return {
    subject: recorder.spy,
    done() {
      return recorder.end()
    }
  }
}

export async function createSaveSpec<T>(context: CaptureContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const recorder = createActionRecorder(context, id, subject, options)
  return {
    subject: recorder.spy,
    done() {
      return recorder.save()
    }
  }
}

export async function createSimulateSpec<T>(context: CaptureContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const player = await createActionPlayer(context, id, subject)
  return {
    subject: player.stub,
    async done() {
      return player.end()
    }
  }
}
