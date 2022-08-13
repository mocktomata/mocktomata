import { AsyncContext } from 'async-fp'
import { Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { TimeTracker } from '../timeTracker'
import { Mocktomata } from '../types'
import { createFixedModeMocktoFn, createMocktoFn } from './createMocktoFn'
import { transformConfig } from './transformConfig'

export namespace createMockto {
  export type Mockto = MocktoFn & {
    live: MocktoFn,
    save: MocktoFn,
    simulate: MocktoFn,
    teardown(): Promise<void>
  }

  export type MocktoFn = {
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
  const ctx = context
    .extend(loadPlugins)
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })
  return Object.assign(
    createMocktoFn(ctx),
    {
      live: createFixedModeMocktoFn(ctx, 'live'),
      save: createFixedModeMocktoFn(ctx, 'save'),
      simulate: createFixedModeMocktoFn(ctx, 'simulate'),
      async teardown() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}
