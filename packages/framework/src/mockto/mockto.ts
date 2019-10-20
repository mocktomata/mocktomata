import { context, MocktomataContext } from '../context';
import { createLiveSpec } from './createLiveSpec';
import { createSaveSpec } from './createSaveSpec';
import { createSimulateSpec } from './createSimulateSpec';
import { SpecIDCannotBeEmpty, SpecNotFound } from './errors';
import { getEffectiveSpecMode } from './getEffectiveSpecMode';
import { CreateSpec, MocktoHandler, SpecMode, MocktoOptions, Spec } from './types';
import { getCallerRelativePath } from './getCallerRelativePath';

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

export function createSpec(defaultMode: SpecMode): CreateSpec {
  const fn = (...args: any[]): any => {
    const { specName, options = { timeout: 3000 }, handler } = resolveCreateSpecArguments(args)
    assertSpecTitle(specName)

    const invokePath = getCallerRelativePath(fn)
    const mode = getEffectiveSpecMode(specName, invokePath, defaultMode)
    let s: Promise<Spec>
    function createSpecWithHandler() {
      if (s) return s
      return s = createActualSpec(specName, invokePath, mode, options)
    }
    if (handler) {
      handler(specName, Object.assign(
        (subject: any) => createSpecWithHandler().then(spec => spec(subject)), {
        done: () => createSpecWithHandler().then(spec => spec.done())
      }))
      return
    }
    else {
      return createActualSpec(specName, invokePath, mode, options)
    }
  }
  return fn
}

async function createActualSpec(title: string, specPath: string, mode: SpecMode, options: MocktoOptions): Promise<Spec> {
  const ctx = await context.get()
  switch (mode) {
    case 'auto':
      return createAutoSpec(ctx, title, specPath, options)
    case 'live':
      return createLiveSpec()
    case 'save':
      return createSaveSpec(ctx, title, specPath, options)
    case 'simulate':
      return createSimulateSpec(ctx, title, specPath, options)
  }
}

function resolveCreateSpecArguments(args: any[]): { specName: string, options: MocktoOptions | undefined, handler: MocktoHandler | undefined } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else if (typeof args[1] === 'function') {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
  else {
    return { specName: args[0], options: args[1], handler: undefined }
  }
}

function assertSpecTitle(id: string) {
  if (id === '') throw new SpecIDCannotBeEmpty()
}

async function createAutoSpec(context: MocktomataContext, title: string, specPath: string, options: MocktoOptions): Promise<Spec> {
  try {
    return await createSimulateSpec(context, title, specPath, options)
  }
  catch (e) {
    if (e instanceof SpecNotFound) return createSaveSpec(context, title, specPath, options)
    else throw e
  }
}
