import { context, SpecContext } from '../context';
import { createLiveSpec } from './createLiveSpec';
import { createSaveSpec } from './createSaveSpec';
import { createSimulateSpec } from './createSimulateSpec';
import { SpecIDCannotBeEmpty, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { CreateSpec, MocktoHandler, MocktoMode, MocktoOptions, Spec } from './types';

export type Mockto = CreateSpec & {
  live: CreateSpec,
  save: CreateSpec,
  simulate: CreateSpec,
}

export const mockto: Mockto = Object.assign(
  createSpec('auto'), {
  live: createSpec('live'),
  save: createSpec('save'),
  simulate: createSpec('simulate')
}
)

export function createSpec(defaultMode: MocktoMode): CreateSpec {
  return (...args: any[]): any => {
    const { id, options = { timeout: 3000 }, handler } = resolveCreateSpecArguments(args)
    assertSpecID(id)

    const mode = getEffectiveSpecMode(id, defaultMode)
    let s: Promise<Spec>
    function createSpecWithHandler() {
      if (s) return s
      return s = createActualSpec(id, mode, options)
    }
    if (handler) {
      handler(id, Object.assign(
        (subject: any) => createSpecWithHandler().then(spec => spec(subject)), {
        done: () => createSpecWithHandler().then(spec => spec.done())
      }))
      return
    }
    else {
      return createActualSpec(id, mode, options)
    }
  }
}

async function createActualSpec(id: string, mode: MocktoMode, options: MocktoOptions): Promise<Spec> {
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

function resolveCreateSpecArguments(args: any[]): { id: string, options: MocktoOptions | undefined, handler: MocktoHandler | undefined } {
  if (args.length === 3) {
    return { id: args[0], options: args[1], handler: args[2] }
  }
  else if (typeof args[1] === 'function') {
    return { id: args[0], options: undefined, handler: args[1] }
  }
  else {
    return { id: args[0], options: args[1], handler: undefined }
  }
}

function assertSpecID(id: string) {
  if (id === '') throw new SpecIDCannotBeEmpty()
}

async function createAutoSpec(context: SpecContext, id: string, options: MocktoOptions): Promise<Spec> {
  try {
    return await createSimulateSpec(context, id, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, id, options)
    else throw e
  }
}
