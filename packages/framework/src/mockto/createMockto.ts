import { AsyncContext } from 'async-fp'
import { Spec } from '../spec'
import { createSpecFn, createFixedModeSpecFn } from './createSpecFn'
import { loadPlugins } from './loadPlugins'
import { Mocktomata } from '../types'

export namespace createMockto {
  export type Mockto = SpecFn & {
    live: SpecFn,
    save: SpecFn,
    simulate: SpecFn,
  }

  export type SpecFn = {
    (specName: string, handler: Spec.Handler): void,
    (specName: string, options: Spec.Options, handler: Spec.Handler): void,
  }
}

export function createMockto(context: AsyncContext<Mocktomata.Context>): createMockto.Mockto {
  const ctx = loadPlugins(context)
  return Object.assign(
    createSpecFn(ctx, 'auto'),
    {
      live: createFixedModeSpecFn(ctx, 'live'),
      save: createFixedModeSpecFn(ctx, 'save'),
      simulate: createFixedModeSpecFn(ctx, 'simulate'),
    }
  )
}
