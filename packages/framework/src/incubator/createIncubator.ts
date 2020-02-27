import { AsyncContext } from 'async-fp'
import { createInertSpecFn, createMockto, createSpecObject, resolveMocktoFnArgs } from '../mockto'
import { loadPlugins } from '../mockto/loadPlugins'
import { Spec } from '../spec'
import { getCallerRelativePath } from '../test-utils'
import { Mocktomata } from '../types'

export namespace createIncubator {
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }) => void
}

export function createIncubator(context: AsyncContext<Mocktomata.Context>) {
  const ctx = loadPlugins(context)
  const save = createInertSpecFn(ctx, 'save')
  const simulate = createInertSpecFn(ctx, 'simulate')
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
