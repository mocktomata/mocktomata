import type { AsyncContext } from 'async-fp'
import type { LogLevel } from 'standard-log'
import { assertMockable } from './assertMockable.js'
import { assertSpecName } from './assertSpecName.js'
import { createSimulator } from './simulator.js'
import { Spec } from './types.js'
import { createSpec } from './types.internal.js'

export async function createSimulateSpec(
  context: AsyncContext<createSpec.Context>,
  specName: string,
  invokePath: string,
  options: Spec.Options
): Promise<Spec> {
  assertSpecName(specName)
  const { io } = await context.get()
  const loaded = await io.readSpec(specName, invokePath)
  const simulator = createSimulator(context, specName, loaded, options)
  let origLogLevel: LogLevel | false | undefined = false

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return simulator.createStub<S>(subject)
    },
    {
      get mode() { return 'simulate' as const },
      async done() {
        simulator.end()
        if (origLogLevel !== false) {
          const { log } = await context.get()
          log.level = origLogLevel
        }
      },
      async enableLog(level?: LogLevel) {
        const { log } = await context.get()
        origLogLevel = log.level
        log.level = level
      },
      ignoreMismatch() { },
      maskValue(value: string) {
        simulator.addMaskValue(value)
      },
    })
}
