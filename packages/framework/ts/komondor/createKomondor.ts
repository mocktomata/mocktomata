import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, MemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import { createLogContext } from '../log/createLogContext.js'
import { loadPlugins } from '../spec-plugin/index.js'
import { createSpecObject, getEffectiveSpecModeContext, Spec } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { initTimeTrackers } from '../timeTracker/index.js'
import { LoadedContext } from '../types.internal.js'
import type { Mocktomata } from '../types.js'

/**
 * Creates a `Spec` that runs in auto mode to simulate the behavior of your code.
 */
export type Komondor = Komondor.Fn & {
  /**
   * Creates a `Spec` that runs in live mode.
   */
  live: Komondor.Fn,
  /**
   * Creates a `Spec` that runs in save mode.
   */
  save: Komondor.Fn,
  /**
   * Creates a `Spec` that runs in simulate mode.
   */
  simulate: Komondor.Fn,
  /**
   * Clean up the system in case some `spec.done()` are not called.
   */
  teardown(): Promise<void>
}

export namespace Komondor {
  export type Fn = (specName: string, options?: Spec.Options) => Spec & {
    /**
     * An in-memory reporter containing the logs for inspection.
     */
    reporter: MemoryLogReporter
  }
}

export function createKomondor(context: AsyncContext<Mocktomata.Context>): Komondor {
  const ctx = context
    .extend(loadConfig)
    .extend(loadPlugins)
    .extend(initTimeTrackers)

  return Object.assign(
    createKomondorFn(ctx),
    {
      live: createKomondorFn(ctx, 'live'),
      save: createKomondorFn(ctx, 'save'),
      simulate: createKomondorFn(ctx, 'simulate'),
      async teardown() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      }
    }
  )
}

function createKomondorFn(context: AsyncContext<LoadedContext>, mode?: Spec.Mode) {
  const komondorFn = (specName: string, options: Spec.Options = { timeout: 3000 }) => {
    const reporter = createMemoryLogReporter()

    return Object.assign(
      createSpecObject(
        context
          .extend({ options, reporter, specName, specRelativePath: getCallerRelativePath(komondorFn) })
          .extend(getEffectiveSpecModeContext(mode))
          .extend(createLogContext)),
      { reporter })
  }
  return komondorFn
}
