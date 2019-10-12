import { Spec, SpecOptions } from '.';
import { SpecContext } from '../context';
import { createValidatingRecord } from './createValidatingRecord';
import { NotSpecable } from './errors';
import { getStub } from './getStub';
import { isSpecable } from './isSpecable';
import { createSpecSimulator } from './SpecSimulator';
import { SpecRecordLive } from './types-internal';

export async function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const loaded = await context.io.readSpec(id)
  const received: SpecRecordLive = { refs: [], actions: [] }
  const record = createValidatingRecord(id, loaded, received, options)
  const simulator = createSpecSimulator(record, options)
  record.onAddAction(simulator.run)

  return {
    subject: getStub({ record }, subject, true),
    async done() {
      record.end()
    }
  }
}
