import { AsyncContext } from 'async-fp'
import { transformConfig } from '../mockto/transformConfig'
import { createSpecObject, getEffectiveSpecMode, Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { getCallerRelativePath } from '../test-utils'
import { TimeTracker } from '../timeTracker'
import { Mocktomata } from '../types'

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
      return { mode, specRelativePath }
    })
    return createSpecObject(ctx, specName, options)
  }
  return komondorFn
}

function createFixedModeKomondorFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const komondorFn = (specName: string, options = { timeout: 3000 }) => {
    const specRelativePath = getCallerRelativePath(komondorFn)
    if (!ctx) ctx = context.extend({ mode, specRelativePath })
    return createSpecObject(ctx, specName, options)
  }
  return komondorFn
}
