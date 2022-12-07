import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import { createLogContext } from '../log/createLogContext.js'
import { loadPlugins } from '../spec-plugin/index.js'
import type { Spec } from '../spec/index.js'
import { createSpecObject, getEffectiveSpecModeContext } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { initTimeTrackers } from '../timeTracker/index.js'
import type { LoadedContext } from '../types.internal.js'
import type { Mocktomata } from '../types.js'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs.js'


/**
 * Create a `Spec` that runs in auto mode.
 */
export type Mockto = Mockto.Fn & {
  /**
   * Create a `Spec` that runs in live mode.
   */
  live: Mockto.Fn,
  /**
   * Create a `Spec` that runs in save mode.
   */
  save: Mockto.Fn,
  /**
   * Create a `Spec` that runs in simulate mode.
   */
  simulate: Mockto.Fn,
  /**
   * Clean up the system in case some `spec.done()` are not called.
   */
  cleanup(): Promise<void>
}

export namespace Mockto {
  export type Fn = {
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

export function createMockto(context: AsyncContext<Mocktomata.Context>): Mockto {
  const ctx = context
    .extend(loadConfig)
    .extend(loadPlugins)
    .extend(initTimeTrackers)

  return Object.assign(
    createMocktoFn(ctx),
    {
      live: createMocktoFn(ctx, 'live'),
      save: createMocktoFn(ctx, 'save'),
      simulate: createMocktoFn(ctx, 'simulate'),
      async cleanup() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}

export function createMocktoFn(context: AsyncContext<LoadedContext>, mode?: Spec.Mode) {
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const reporter = createMemoryLogReporter()

    handler(specName,
      createSpecObject(
        context
          .extend({
            options, reporter, specName,
            specRelativePath: options.testRelativePath ?? getCallerRelativePath(specFn)
          })
          .extend(getEffectiveSpecModeContext(mode))
          .extend(createLogContext)),
      reporter)
  }
  return specFn as Mockto.Fn
}
