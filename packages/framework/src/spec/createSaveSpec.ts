import { SpecContext } from '../context';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { createSpyRecord } from './createSpyRecord';
import { createSpy } from './spying';
import { Spec, SpecOptions } from './types';

export async function createSaveSpec(context: SpecContext, specName: string, invokePath: string, options: SpecOptions): Promise<Spec> {
  assertSpecName(specName)

  const record = createSpyRecord(specName, options)
  return Object.assign(
    async (subject: any) => {
      assertMockable(subject)
      return createSpy({ record, subject, mode: 'passive' })!
    }, {
    async done() {
      record.end()
      const sr = record.getSpecRecord()
      context.io.writeSpec(specName, invokePath, sr)
    }
  })
}
