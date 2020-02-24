import { AsyncContext } from 'async-fp'
import { createSpec, Spec } from '../spec'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'
import { SpecPlugin, addPluginModule } from '../spec-plugin'

export namespace createMockto {
  export type Config = Spec.Config & SpecPlugin.Config
  export type IO = Spec.IO & SpecPlugin.IO
  export type Context = {
    config: Config,
    io: IO,
    getCallerRelativePath(subject: Function): string
  }
  export type Mockto = SpecFn & {
    live: SpecFn,
    save: SpecFn,
    simulate: SpecFn,
  }

  export type SpecFn = {
    (specName: string, handler: Spec.Handler): void,
    (specName: string, options: Spec.Options, handler: Spec.Handler): void,
  }
}

export function createMockto(context: AsyncContext<createMockto.Context>): createMockto.Mockto {
  const ctx = context.merge(async () => {
    const { config, io } = await context.get()
    const plugins = [] as SpecPlugin.Instance[]
    for (const plugin of config.plugins) {
      const m = await io.loadPlugin(plugin)
      plugins.push(...addPluginModule(plugin, m))
    }
    return { plugins }
  })
  return Object.assign(
    createSpecFn(ctx, 'auto'),
    {
      live: createSpecFn(ctx, 'live'),
      save: createSpecFn(ctx, 'save'),
      simulate: createSpecFn(ctx, 'simulate'),
    }
  )
}

function createSpecFn(context: AsyncContext<Spec.Context & {
  getCallerRelativePath(subject: Function): string
}>, defaultMode: Spec.Mode) {
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const ctx = context.merge(async () => {
      const { config, getCallerRelativePath } = await context.get()
      const specRelativePath = getCallerRelativePath(specFn)
      const mode = getEffectiveSpecMode(config, defaultMode, specName, specRelativePath)
      return { specRelativePath, mode }
    })

    handler(specName, createSpecObject(ctx, specName, options))
  }
  return specFn
}

function createSpecObject(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string
}>, specName: string, options: Spec.Options) {

  async function createActualSpec() {
    const { mode, specRelativePath } = await context.get()
    return createSpec(context, specName, specRelativePath, mode, options)
  }

  const spec = ((subject: any) => createActualSpec().then(actualSpec => {
    spec.getSpecRecord = actualSpec.getSpecRecord
    spec.enableLog = actualSpec.enableLog
    spec.done = actualSpec.done
    spec.getSpecRecord = actualSpec.getSpecRecord
    return actualSpec(subject)
  })) as Spec
  return spec
}

function resolveMocktoFnArgs(args: any[]): { specName: string, options: Spec.Options | undefined, handler: Spec.Handler } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}
