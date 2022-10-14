import type { AsyncContext } from 'async-fp'
import { createConsoleLogReporter, createMemoryLogReporter, createStandardLog, Logger, MemoryLogReporter } from 'standard-log'
import { createFixedModeMocktoFn } from '../mockto/createMocktoFn.js'
import { resolveMocktoFnArgs } from '../mockto/resolveMocktoFnArgs.js'
import { transformConfig } from '../mockto/transformConfig.js'
import { loadPlugins, SpecPlugin } from '../spec-plugin/index.js'
import { createSpecObject, Spec } from '../spec/index.js'
import { createTestIO, getCallerRelativePath } from '../test-utils/index.js'
import type { TimeTracker } from '../timeTracker/index.js'
import type { Mocktomata } from '../types.js'

export namespace createIncubator {
  export type Context = { config: Mocktomata.Config, io: createTestIO.TestIO, log: Logger }
  export type IncubatorFn = {
    /**
     * Creates an automatic incubator spec.
     * Automatic spec will record and save a record in the first run.
     * In subsequent runs, the saved record will be used to simulate the behavior.
     * @param specName Name of the spec. Every test in the same file must have a unique spec name.
     */
    (specName: string, handler: Handler): void,
    (specName: string, options: Spec.Options, handler: Handler): void,
  }
  export type Handler = (title: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>
  export type SequenceFn = (specName: string, handler: SequenceHandler) => void
  export type SequenceHandler = (title: string, specs: { save: Spec, simulate: Spec }, reporter: MemoryLogReporter) => void
  export type ConfigOptions = {
    plugins: Array<string | [pluginName: string, activate: ((context: SpecPlugin.ActivationContext) => any)]>
  }
}

export function createIncubator(context: AsyncContext<createIncubator.Context>) {
  let ctxValue: { plugins: SpecPlugin.Instance[] } | undefined
  let pluginInstances: SpecPlugin.Instance[] | undefined

  const ctx = context
    .extend(loadPlugins)
    .extend(async value => {
      ctxValue = value
      return { plugins: value.plugins = pluginInstances ?? value.plugins }
    })
    .extend(transformConfig)
    .extend({ timeTrackers: [] as TimeTracker[] })

  const config = async function (options: createIncubator.ConfigOptions) {
    const { plugins } = await context.extend(async ({ config, io }) => {
      const plugins = options.plugins.map(p => {
        // istanbul ignore next
        if (typeof p === 'string') return p
        const [name, activate] = p
        io.addPluginModule(name, { activate })
        return name
      })
      return { config: { ...config, plugins } }
    }).extend(loadPlugins).get()
    if (!ctxValue) pluginInstances = plugins
    else ctxValue.plugins.splice(0, ctxValue.plugins.length, ...plugins)
  }
  const save = createFixedModeMocktoFn(ctx, 'save')
  const simulate = createFixedModeMocktoFn(ctx, 'simulate')
  const sequence: createIncubator.SequenceFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<createIncubator.SequenceHandler>(args)
    const specRelativePath = getCallerRelativePath(sequence)
    const reporter = createMemoryLogReporter()
    const sl = createStandardLog({ reporters: [createConsoleLogReporter(), reporter] })
    handler(specName, {
      save: createSpecObject(ctx.extend(() => {
        const mode = 'save'
        const title = `${specName}: ${mode}`
        const log = sl.getLogger(`mocktomata:${title}`)
        return { mode, specRelativePath, log }
      }), specName, options),
      simulate: createSpecObject(ctx.extend(() => {
        const mode = 'simulate'
        const title = `${specName}: ${mode}`
        const log = sl.getLogger(`mocktomata:${title}`)
        return { mode, specRelativePath, log }
      }), specName, options)
    }, reporter)
  }
  const duo: createIncubator.IncubatorFn = (...args: any[]) => {
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
    config,
    async teardown() {
      const { timeTrackers } = await ctx.get()
      timeTrackers.forEach(t => t.terminate())
    }
  })
}
