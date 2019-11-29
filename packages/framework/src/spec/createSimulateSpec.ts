import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { enableLog } from './enableLog';
import { createSimulator } from './simulator';
import { Spec, SpecOptions } from './types';

export async function createSimulateSpec(
  context: SpecContext,
  specName: string,
  invokePath: string,
  options: SpecOptions
): Promise<Spec> {
  assertSpecName(specName)

  const loaded = await context.io.readSpec(specName, invokePath)
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
