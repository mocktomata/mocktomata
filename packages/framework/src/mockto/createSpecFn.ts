import { AsyncContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { createSpec, Spec } from '../spec'
import { getCallerRelativePath } from '../test-utils'
import { createMockto } from './createMockto'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs'

export function createSpecFn(context: AsyncContext<Spec.Context>, defaultMode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    if (!ctx) {
      ctx = context.merge(async () => {
        const { config } = await context.get()
        const specRelativePath = getCallerRelativePath(specFn)
        const mode = getEffectiveSpecMode(config, defaultMode, specName, specRelativePath)
        return { specRelativePath, mode }
      }, { lazy: true })
    }
    handler(specName, createSpecObject(ctx, specName, options))
  }
  return specFn as createMockto.SpecFn
}

export function createFixedModeSpecFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    if (!ctx) {
      ctx = context.merge(async () => {
        const specRelativePath = getCallerRelativePath(specFn)
        return { mode, specRelativePath }
      }, { lazy: true })
    }
    handler(`${specName}: ${mode}`, createSpecObject(ctx, specName, options))
  }
  return specFn as createMockto.SpecFn
}

export function createSpecObject(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string
}>, specName: string, options: Spec.Options) {

  let s: Spec
  const initState: { enableLog: boolean, logLevel?: LogLevel } = { enableLog: false }
  async function createActualSpec(initState: { enableLog: boolean, logLevel?: LogLevel }) {
    if (s) return s
    const { mode, specRelativePath } = await context.get()
    s = await createSpec(context, specName, specRelativePath, mode, options)
    if (initState.enableLog) s.enableLog(initState.logLevel)
    return s
  }

  const spec = Object.assign((subject: any) => createActualSpec(initState).then(actualSpec => {
    spec.done = actualSpec.done
    return actualSpec(subject)
  }), {
    enableLog: (level: LogLevel = logLevels.all) => {
      if (s) s.enableLog(level)
      else {
        initState.enableLog = true
        initState.logLevel = level
      }
    },
  }) as Spec
  return spec
}
