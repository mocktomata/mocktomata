import { AsyncContext } from 'async-fp'
import { createMockto } from '../mockto'
import { createFixedModeMocktoFn } from '../mockto/createMocktoFn'
import { resolveMocktoFnArgs } from '../mockto/resolveMocktoFnArgs'
import { transformConfig } from '../mockto/transformConfig'
import { createSpecObject, Spec } from '../spec'
import { loadPlugins } from '../spec-plugin'
import { getCallerRelativePath } from '../test-utils'
import { TimeTracker } from '../timeTracker'
import { Mocktomata } from '../types'

export namespace createIncubator {
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }) => void
}

export function createIncubator(context: AsyncContext<Mocktomata.Context>) {
  const ctx = context.merge({ timeTrackers: [] as TimeTracker[] }, { lazy: true }).merge(loadPlugins, { lazy: true }).merge(transformConfig, { lazy: true })
  const save = createFixedModeMocktoFn(ctx, 'save')
  const simulate = createFixedModeMocktoFn(ctx, 'simulate')
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
  const duo: createMockto.MocktoFn = (...args: any[]) => {
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
