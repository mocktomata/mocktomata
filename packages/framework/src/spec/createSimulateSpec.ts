import { AsyncContext } from 'async-fp'
import { assertMockable } from './assertMockable'
import { assertSpecName } from './assertSpecName'
import { enableLog } from './enableLog'
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
  const simulator = createSimulator(specName, loaded, options)

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return simulator.createStub<S>(subject)
    },
    {
      async done() {
        simulator.end()
      },
      enableLog,
      getSpecRecord: () => simulator.getSpecRecord()
    })
}
