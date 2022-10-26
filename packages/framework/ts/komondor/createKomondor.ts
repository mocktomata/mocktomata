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

export namespace createKomondor {
  export type Komondor = KomondorFn & {
    live: KomondorFn,
    save: KomondorFn,
    simulate: KomondorFn,
    teardown(): Promise<void>
  }

  export type KomondorFn = (specName: string, options?: Spec.Options) => Spec & { reporter: MemoryLogReporter }
}

export function createKomondor(context: AsyncContext<Mocktomata.Context>): createKomondor.Komondor {
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
