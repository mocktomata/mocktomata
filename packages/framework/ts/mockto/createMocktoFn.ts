import type { AsyncContext } from 'async-fp'
import type { MemoryLogReporter } from 'standard-log'
import { createSpecObject, getEffectiveSpecMode, Spec } from '../spec/index.js'
import { getCallerRelativePath } from '../test-utils/index.js'
import { createMockto } from './createMockto.js'
import { resolveMocktoFnArgs } from './resolveMocktoFnArgs.js'

export function createMocktoFn(context: AsyncContext<Spec.Context>) {
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const specRelativePath = getCallerRelativePath(specFn)
    const ctx = context.extend(async () => {
      const { config } = await context.get()
      const mode = getEffectiveSpecMode(config, specName, specRelativePath)
      return { mode, specRelativePath }
    })
    handler(specName, createSpecObject(ctx, specName, options))
  }
  return specFn as createMockto.MocktoFn
}

export function createFixedModeMocktoFn(context: AsyncContext<Spec.Context>, mode: Spec.Mode, reporter?: MemoryLogReporter) {
  let ctx: AsyncContext<Spec.Context & {
    mode: Spec.Mode,
    specRelativePath: string,
  }> | undefined
  const specFn = (...args: any[]) => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs<any>(args)
    const specRelativePath = getCallerRelativePath(specFn)
    if (!ctx) ctx = context.extend({ mode, specRelativePath })

    handler(`${specName}: ${mode}`, createSpecObject(ctx, specName, options), reporter)
  }
  return specFn as createMockto.MocktoFn
}
