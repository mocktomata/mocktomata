import { AsyncContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { Spec } from '../spec'
import { createSaveSpec } from '../spec/createSaveSpec'
import { createSimulateSpec } from '../spec/createSimulateSpec'
import { createTestHarness } from './createTestHarness'
import { ensureDirNotExists, ensureFileNotExists } from './ensures'

const context = new AsyncContext<Spec.Context>()

/**
 * Run spec in both save and simulate mode
 */
const testDuo: incubator.Fn = (...args: any[]) => {
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

const testSave: incubator.Fn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: save`
  handler(title, createTestSpec(createSaveSpec, specName, options))
}

const testSimulate: incubator.Fn = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs(args)
  const title = `${specName}: simulate`
  handler(title, createTestSpec(createSimulateSpec, specName, options))
}

/**
 * Runs save and simulate in different sequence.
 */
const testSequence: incubator.Fn<incubator.SequenceHandler> = (...args: any[]) => {
  const { specName, options, handler } = resolveTestSpecFnArgs<incubator.SequenceHandler>(args)
  handler(specName, {
    save: createTestSpec(createSaveSpec, specName, options),
    simulate: createTestSpec(createSimulateSpec, specName, options)
  })
}

function createTestSpec(specFn: typeof createSaveSpec, specName: string, options: Spec.Options = { timeout: 3000 }): Spec {
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
    // eslint-disable-next-line require-atomic-updates
    s = await specFn(context, specName, '', options)
    if (initState.enableLog) {
      s.enableLog(initState.logLevel)
    }

    return s
  }
}

function resolveTestSpecFnArgs<H = Spec.Handler>(args: any[]): { specName: string, options: Spec.Options | undefined, handler: H } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}

export type incubator = {
  save: incubator.Fn<Spec.Handler>,
  simulate: incubator.Fn<Spec.Handler>,
  duo: incubator.Fn<Spec.Handler>,
  sequence: incubator.Fn<incubator.SequenceHandler>,
  start: (options?: createTestHarness.Options | undefined) => Promise<createTestHarness.TestHarness>,
  ensureDirNotExists: (dirpath: string) => void,
  ensureFileNotExists: (filepath: string) => void,
}

export namespace incubator {
  export type Fn<H = Spec.Handler> = {
    (specName: string, handler: H): void,
    (specName: string, options: Spec.Options, handler: H): void,
  }
  export type SequenceHandler = (specName: string, specs: { save: Spec, simulate: Spec }) => void
}

export const incubator = {
  save: testSave,
  simulate: testSimulate,
  duo: testDuo,
  sequence: testSequence,
  start: (options?: createTestHarness.Options) => {
    return createTestHarness(context, options).start()
  },
  ensureDirNotExists,
  ensureFileNotExists
} as incubator
