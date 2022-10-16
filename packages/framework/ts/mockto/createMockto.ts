import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter } from 'standard-log'
import { transformConfig } from '../config/index.js'
import { createLogContext } from '../log/createLogContext.js'
import { loadPlugins } from '../spec-plugin/index.js'
import type { Spec } from '../spec/index.js'
import { createSpecObject, getEffectiveSpecModeContext } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import type { TimeTracker } from '../timeTracker/index.js'
import type { Mocktomata } from '../types.js'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs.js'

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
      live: createMocktoFn(ctx, 'live'),
      save: createMocktoFn(ctx, 'save'),
      simulate: createMocktoFn(ctx, 'simulate'),
      async teardown() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}

export function createMocktoFn(context: AsyncContext<Spec.Context>, mode?: Spec.Mode) {
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const reporter = createMemoryLogReporter()
    const specRelativePath = getCallerRelativePath(specFn)

    handler(specName,
      createSpecObject(
        context
          .extend({ reporter, specName, specRelativePath })
          .extend(getEffectiveSpecModeContext(mode))
          .extend(createLogContext),
        specName,
        options),
      reporter)
  }
  return specFn as createMockto.MocktoFn
}
