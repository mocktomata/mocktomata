import type { AsyncContext } from 'async-fp'
import { createConsoleLogReporter, createMemoryLogReporter, createStandardLog } from 'standard-log'
import { createSpecObject, getEffectiveSpecMode, Spec } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { createMockto } from './createMockto.js'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs.js'

export function createMocktoFn(context: AsyncContext<Spec.Context>) {
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const specRelativePath = getCallerRelativePath(specFn)
    const reporter = createMemoryLogReporter()
    const sl = createStandardLog({ reporters: [createConsoleLogReporter(), reporter] })
    const log = sl.getLogger(`mocktomata:${specName}`)
    const ctx = context.extend(async ({ config }) => ({
      mode: getEffectiveSpecMode(config, specName, specRelativePath),
      specRelativePath
    })).extend({ log })

    handler(specName, createSpecObject(ctx, specName, options), reporter)
  }
  return specFn as createMockto.MocktoFn
}

export function createFixedModeMocktoFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<any>(args)
    const specRelativePath = getCallerRelativePath(specFn)
    const title = `${specName}: ${mode}`
    // console.info('before context.extend', ctx, mode, specRelativePath)
    const reporter = createMemoryLogReporter()
    const sl = createStandardLog({ reporters: [createConsoleLogReporter(), reporter] })
    const log = sl.getLogger(`mocktomata:${title}`)
    if (!ctx) ctx = context.extend({ mode, specRelativePath }).extend({ log })
    // ctx.get().then(c => console.info('ctx result', c))
    handler(title, createSpecObject(ctx, specName, options), reporter)
  }
  return specFn as createMockto.MocktoFn
}
