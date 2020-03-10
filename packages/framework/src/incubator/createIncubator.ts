import { AsyncContext } from 'async-fp'
import { createMockto } from '../mockto'
import { createFixedModeSpecFn, createSpecObject } from '../mockto/createSpecFn'
import { resolveMocktoFnArgs } from '../mockto/resolveMocktoFnArgs'
import { transformConfig } from '../mockto/transformConfig'
import { Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { getCallerRelativePath } from '../test-utils'
import { Mocktomata } from '../types'
import { TimeTracker } from '../spec/createTimeTracker'

export namespace createIncubator {
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }) => void
}

export function createIncubator(context: AsyncContext<Mocktomata.Context>) {
  const ctx = context.merge({ timeTrackers: [] as TimeTracker[] }, { lazy: true }).merge(loadPlugins, { lazy: true }).merge(transformConfig, { lazy: true })
  const save = createFixedModeSpecFn(ctx, 'save')
  const simulate = createFixedModeSpecFn(ctx, 'simulate')
  const sequence: createIncubator.SequenceFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<createIncubator.SequenceHandler>(args)
    const sctx = ctx.merge(async () => {
      const specRelativePath = getCallerRelativePath(sequence)
      return { specRelativePath }
    })
    handler(specName, {
      save: createSpecObject(sctx.merge({ mode: 'save' }), specName, options),
      simulate: createSpecObject(sctx.merge({ mode: 'simulate' }), specName, options)
    })
  }
  const duo: createMockto.SpecFn = (...args: any[]) => {
    const { specName, options, handler } = resolveMocktoFnArgs(args)
    if (options) {
      save(specName, options, handler)
      simulate(specName, options, handler)
    }
    else {
      save(specName, handler)
      simulate(specName, handler)
    }
  }

  return {
    save,
    simulate,
    duo,
    sequence
  }
}
