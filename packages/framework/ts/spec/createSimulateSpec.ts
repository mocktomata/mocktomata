import type { AsyncContext } from 'async-fp'
import { assertMockable } from './assertMockable.js'
import { assertSpecName } from './assertSpecName.js'
import { createSimulator } from './simulator.js'
import { createSpec } from './types.internal.js'
import { Spec } from './types.js'

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

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return simulator.createStub<S>(subject)
    },
    {
      get mode() { return 'simulate' as const },
      async done() {
        simulator.end()
        return loaded
      },
      ignoreMismatch() { },
      maskValue(value: string) {
        simulator.addMaskValue(value)
      },
    })
}
