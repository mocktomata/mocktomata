import { Spec, SpecOptions } from '.';
import { SpecContext } from '../context';
import { createValidatingRecord } from './createValidatingRecord';
import { NotSpecable } from './errors';
import { getStub } from './getStub';
import { isSpecable } from './isSpecable';
import { createSpecSimulator } from './SpecSimulator';
import { SpecRecordLive } from './typesInternal';

export async function createSimulateSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const player = await createSpecPlayer(context, id, subject, options)
  return {
    subject: player.subject,
    async done() {
      return player.end()
    }
  }
}

export async function createSpecPlayer<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const loaded = await context.io.readSpec(id)
  const received: SpecRecordLive = { refs: [], actions: [] }
  const record = createValidatingRecord(id, loaded, received, options)
  const simulator = createSpecSimulator(record, options)
  record.onAddAction(simulator.run)
  return {
    subject: getStub({ record }, subject, true),
    end: async () => record.end(),
  }
}
