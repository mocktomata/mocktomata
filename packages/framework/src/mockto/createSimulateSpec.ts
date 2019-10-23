import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { createSimulator } from './createSimulator';
import { createValidateRecord } from './createValidateRecord';
import { createStub } from './stubing';
import { SpecOptions, Spec } from './types';
import { assertSpecName } from './assertSpecName';

export async function createSimulateSpec(context: SpecContext, specName: string, invokePath: string, options: SpecOptions): Promise<Spec> {
  assertSpecName(specName)

  const loaded = await context.io.readSpec(specName, invokePath)

  const record = createValidateRecord(specName, loaded, options)
  const simulator = createSimulator(record, options)
  record.onAddAction(simulator.run)

  return Object.assign(
    async (subject: any) => {
      assertMockable(subject)
      return createStub({ record, subject })
    }, {
    async done() {
      record.end()
    }
  })
}
