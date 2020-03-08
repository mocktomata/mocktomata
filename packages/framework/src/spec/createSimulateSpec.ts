import { AsyncContext } from 'async-fp'
import { LogLevel } from 'standard-log'
import { log } from '../log'
import { assertMockable } from './assertMockable'
import { assertSpecName } from './assertSpecName'
import { createSimulator } from './simulator'
import { Spec } from './types'

export async function createSimulateSpec(
  context: AsyncContext<Spec.Context>,
  specName: string,
  invokePath: string,
  options: Spec.Options
): Promise<Spec> {
  assertSpecName(specName)
  const { io } = await context.get()
  const loaded = await io.readSpec(specName, invokePath)
  const simulator = createSimulator(context, specName, loaded, options)
  let enabledLog = false
  const origLogLevel = log.level

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return simulator.createStub<S>(subject)
    },
    {
      get mode() { return 'simulate' as const },
      async done() {
        simulator.end()
        if (enabledLog) log.level = origLogLevel
      },
      enableLog: (level?: LogLevel) => {
        enabledLog = true
        log.level = level
      },
      ignoreMismatch() {},
    })
}
