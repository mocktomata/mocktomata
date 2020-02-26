import a, { AssertOrder } from 'assertron'
import { AsyncContext } from 'async-fp'
import { createInertSpecFn, createMockto, createSpecObject, resolveMocktoFnArgs } from '../mockto'
import { loadPlugins } from '../mockto/loadPlugins'
import { Spec, SpecNotFound } from '../spec'
import { createTestContext } from '../test-utils'
import { Mocktomata } from '../types'

export namespace createIncubator {
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (specName: string, specs: { save: Spec, simulate: Spec }) => void
}

export function createIncubator(context: AsyncContext<Mocktomata.Context>) {
  const ctx = loadPlugins(context)
  const save = createInertSpecFn(ctx, 'save')
  const simulate = createInertSpecFn(ctx, 'simulate')
  const sequence: createIncubator.SequenceFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<createIncubator.SequenceHandler>(args)
    const sctx = ctx.merge(async () => {
      const { getCallerRelativePath } = await ctx.get()
      const specRelativePath = getCallerRelativePath(sequence)
      return { specRelativePath }
    })
    handler(specName, {
      save: createSpecObject(sctx.merge({ mode: 'save' }), specName, options),
      simulate: createSpecObject(sctx.merge({ mode: 'simulate' }), specName, options)
    })
  }
  return {
    save,
    simulate,
    duo: ((...args: any[]) => {
      const { specName, options, handler } = resolveMocktoFnArgs(args)
      if (options) {
        save(specName, options, handler)
        simulate(specName, options, handler)
      }
      else {
        save(specName, handler)
        simulate(specName, handler)
      }
    }) as createMockto.SpecFn,
    sequence
  }
}

const context = createTestContext()
const incubator = createIncubator(context)

incubator.save('save', (title, spec) => {
  test(title, async () => {
    const subject = await spec({ a: 1 })
    expect(subject.a).toBe(1)
    subject.a = 2
    expect(subject.a).toBe(2)
    await spec.done()
  })
})

incubator.simulate('simulate', (title, spec) => {
  test(title, async () => {
    a.throws(() => spec({ a: 1 }), SpecNotFound)
  })
})

incubator.duo('duo', (title, spec) => {
  const o = new AssertOrder(1)
  test(title, async () => {
    const s = await spec((x: number) => {
      o.once(1)
      return x + 1
    })
    expect(s(1)).toBe(2)
    await spec.done()
  })
})
