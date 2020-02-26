import { AsyncContext } from 'async-fp'
import { createSpec, Spec } from '../spec'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs'
import { createMockto } from './createMockto'
import { LogLevel, logLevels } from 'standard-log'

export function createSpecFn(context: AsyncContext<Spec.Context & {
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
  return specFn as createMockto.SpecFn
}

export function createInertSpecFn(context: AsyncContext<Spec.Context & {
  getCallerRelativePath(subject: Function): string
}>, mode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    if (!ctx) {
      ctx = context.merge(async () => {
        const { getCallerRelativePath } = await context.get()
        const specRelativePath = getCallerRelativePath(specFn)
        return { mode, specRelativePath }
      }, { lazy: true })
    }
    const title = `${specName}: ${mode}`
    handler(title, createSpecObject(ctx, specName, options))
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
    spec.getSpecRecord = actualSpec.getSpecRecord
    spec.enableLog = actualSpec.enableLog
    spec.done = actualSpec.done
    spec.getSpecRecord = actualSpec.getSpecRecord
    return actualSpec(subject)
  }), {
    enableLog: (level: LogLevel = logLevels.all) => {
      if (s) s.enableLog(level)
      else {
        initState.enableLog = true
        initState.logLevel = level
      }
    },
    getSpecRecord: () => s.getSpecRecord(),
  }) as Spec
  return spec
}
