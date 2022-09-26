import { AsyncContext } from 'async-fp'
import { transformConfig } from '../mockto/transformConfig.js'
import { createSpecObject, getEffectiveSpecMode, Spec } from '../spec/index.js'
import { loadPlugins } from '../spec-plugin/index.js'
import { MaskCriterion } from '../spec/types.internal.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { TimeTracker } from '../timeTracker/index.js'
import { Mocktomata } from '../types.js'

export namespace createKomondor {
  export type Komondor = KomondorFn & {
    live: KomondorFn,
    save: KomondorFn,
    simulate: KomondorFn,
    teardown(): Promise<void>
  }

  export type KomondorFn = (specName: string, options?: Spec.Options) => Spec
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
    const ctx = context.extend(async () => {
      const { config } = await context.get()
      const mode = getEffectiveSpecMode(config, specName, specRelativePath)
      return { mode, specRelativePath, maskCriteria: [] }
    })
    return createSpecObject(ctx, specName, options)
  }
  return komondorFn
}

function createFixedModeKomondorFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
    maskCriteria: MaskCriterion[]
  }> | undefined
  const komondorFn = (specName: string, options = { timeout: 3000 }) => {
    const specRelativePath = getCallerRelativePath(komondorFn)
    if (!ctx) ctx = context.extend({ mode, specRelativePath, maskCriteria: [] })
    return createSpecObject(ctx, specName, options)
  }
  return komondorFn
}
