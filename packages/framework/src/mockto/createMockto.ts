import { AsyncContext } from 'async-fp'
import { Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { Mocktomata } from '../types'
import { createFixedModeSpecFn, createSpecFn } from './createSpecFn'
import { transformConfig } from './transformConfig'

export namespace createMockto {
  export type Mockto = SpecFn & {
    live: SpecFn,
    save: SpecFn,
    simulate: SpecFn,
  }

  export type SpecFn = {
    /**
     * Creates an automatic spec.
     * Automatic spec will record and save a record in the first run.
     * In subsequent runs, the saved record will be used to simulate the behavior.
     * @param specName Name of the spec. Every test in the same file must have a unique spec name.
     */
    (specName: string, handler: Spec.Handler): void,
    (specName: string, options: Spec.Options, handler: Spec.Handler): void,
  }
}

export function createMockto(context: AsyncContext<Mocktomata.Context>): createMockto.Mockto {
  const ctx = context.merge(loadPlugins, { lazy: true }).merge(transformConfig, { lazy: true })
  return Object.assign(
    createSpecFn(ctx),
    {
      live: createFixedModeSpecFn(ctx, 'live'),
      save: createFixedModeSpecFn(ctx, 'save'),
      simulate: createFixedModeSpecFn(ctx, 'simulate'),
    }
  )
}
