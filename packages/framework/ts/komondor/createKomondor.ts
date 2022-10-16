import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, MemoryLogReporter } from 'standard-log'
import { transformConfig } from '../config/index.js'
import { createLogContext } from '../log/createLogContext.js'
import { loadPlugins } from '../spec-plugin/index.js'
import { createSpecObject, getEffectiveSpecMode, Spec } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import type { TimeTracker } from '../timeTracker/index.js'
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
    .extend(loadPlugins)
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })

  return Object.assign(
    createKomondorFn(ctx),
    {
      live: createFixedModeKomondorFn(ctx, 'live'),
      save: createFixedModeKomondorFn(ctx, 'save'),
      simulate: createFixedModeKomondorFn(ctx, 'simulate'),
      async teardown() {
        const { timeTrackers } = await ctx.get()
        timeTrackers.forEach(t => t.terminate())
      },
    }
  )
}

function createKomondorFn(context: AsyncContext<Spec.Context>): createKomondor.KomondorFn {
  const komondorFn = (specName: string, options = { timeout: 3000 }) => {
    const specRelativePath = getCallerRelativePath(komondorFn)
    const reporter = createMemoryLogReporter()
    const ctx = context.extend(async ({ config }) => ({
      mode: getEffectiveSpecMode(config, specName, specRelativePath),
      reporter,
      specName,
      specRelativePath,
      maskCriteria: []
    })).extend(createLogContext)
    return Object.assign(createSpecObject(ctx, specName, options), {
      reporter
    })
  }
  return komondorFn
}

function createFixedModeKomondorFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode) {
  const komondorFn = (specName: string, options = { timeout: 3000 }) => {
    const specRelativePath = getCallerRelativePath(komondorFn)
    const reporter = createMemoryLogReporter()
    return Object.assign(createSpecObject(context
      .extend({ mode, reporter, specName, specRelativePath, maskCriteria: [] })
      .extend(createLogContext), specName, options), {
      reporter
    })
  }
  return komondorFn
}
