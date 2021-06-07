import { AsyncContext } from 'async-fp'
import { LeftJoin } from 'type-plus'
import { createMockto } from '../mockto'
import { createFixedModeMocktoFn } from '../mockto/createMocktoFn'
import { resolveMocktoFnArgs } from '../mockto/resolveMocktoFnArgs'
import { transformConfig } from '../mockto/transformConfig'
import { createSpecObject, Spec } from '../spec'
import { loadPlugins, SpecPlugin } from '../spec-plugin'
import { createTestIO, getCallerRelativePath } from '../test-utils'
import { TimeTracker } from '../timeTracker'
import { Mocktomata } from '../types'

export namespace createIncubator {
  export type Context = { config: Mocktomata.Config, io: createTestIO.TestIO }
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }) => void
  export type ConfigOptions = {
    plugins: Array<string | [string, ((context: SpecPlugin.ActivationContext) => any)]>
  }
}

export function createIncubator(context: AsyncContext<createIncubator.Context>) {
  let ctxValue: LeftJoin<createIncubator.Context, { plugins: SpecPlugin.Instance[] }> | undefined
  let pluginInstances: SpecPlugin.Instance[] | undefined

  const ctx = context
    .extend(loadPlugins)
    .extend(async ctx => {
      ctxValue = await ctx.get()
      return { plugins: ctxValue.plugins = pluginInstances || ctxValue.plugins }
    })
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })

  const config = async function (options: createIncubator.ConfigOptions) {
    const { plugins } = await context.extend(async ctx => {
      const { config, io } = await ctx.get()
      config.plugins = options.plugins.map(p => {
        // istanbul ignore next
        if (typeof p === 'string') return p
        io.addPluginModule(p[0], { activate: p[1] })
        return p[0]
      })
      return {}
    }).extend(loadPlugins).get()
    if (!ctxValue) pluginInstances = plugins
    else ctxValue.plugins.splice(0, ctxValue.plugins.length, ...plugins)
  }
  const save = createFixedModeMocktoFn(ctx, 'save')
  const simulate = createFixedModeMocktoFn(ctx, 'simulate')
  const sequence: createIncubator.SequenceFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<createIncubator.SequenceHandler>(args)
    const stx = ctx.extend({ specRelativePath: getCallerRelativePath(sequence) })
    handler(specName, {
      save: createSpecObject(stx.extend({ mode: 'save' }), specName, options),
      simulate: createSpecObject(stx.extend({ mode: 'simulate' }), specName, options)
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

  return Object.assign(duo, {
    save,
    simulate,
    sequence,
    config
  })
}
