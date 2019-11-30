import { LogLevel, logLevels } from 'standard-log';
import { context } from '../context';
import { createSaveSpec } from '../spec/createSaveSpec';
import { createSimulateSpec } from '../spec/createSimulateSpec';
import { Spec, SpecHandler, SpecOptions } from '../spec/types';
import { SequenceHandler } from './types';

/**
 * Run spec in both save and simulate mode
 */
export const testDuo: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  if (options) {
    testSave(specName, options, handler)
    testSimulate(specName, options, handler)
  }
  else {
    testSave(specName, handler)
    testSimulate(specName, handler)
  }
}

export const testSave: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: save`
  handler(title, createTestSpec(createSaveSpec, specName, options))
}

export const testSimulate: TestSpecFn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: simulate`
  handler(title, createTestSpec(createSimulateSpec, specName, options))
}


/**
 * Runs save and simulate in different sequence.
 */
export const testSequence: TestSpecFn<SequenceHandler> = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs<SequenceHandler>(args)
  handler(specName, {
    save: createTestSpec(createSaveSpec, specName, options),
    simulate: createTestSpec(createSimulateSpec, specName, options)
  })
}

function createTestSpec(specFn: typeof createSaveSpec, specName: string, options: SpecOptions = { timeout: 3000 }): Spec {
  let s: Spec
  const initState: { enableLog: boolean, logLevel?: LogLevel } = { enableLog: false }
  return Object.assign(
    (subject: any) => getSpec(initState).then(s => s(subject)),
    {
      done: () => getSpec(initState).then(s => s.done()),
      enableLog: (level: LogLevel = logLevels.all) => {
        if (s) s.enableLog(level)
        else {
          initState.enableLog = true
          initState.logLevel = level
        }
      },
      getSpecRecord: () => s.getSpecRecord(),
    })

  async function getSpec(initState: { enableLog: boolean, logLevel?: LogLevel }) {
    if (s) return s
    const ctx = await context.get()
    // eslint-disable-next-line require-atomic-updates
    s = await specFn(ctx, specName, '', options)
    if (initState.enableLog) {
      s.enableLog(initState.logLevel)
    }

    return s
  }
}

export function resolveTestSpecFnArgs<H = SpecHandler>(args: any[]): { specName: string, options: SpecOptions | undefined, handler: H } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}

export type TestSpecFn<H = SpecHandler> = {
  (specName: string, handler: H): void,
  (specName: string, options: SpecOptions, handler: H): void,
}
