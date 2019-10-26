import { SpecContext } from '../context';
import { log } from '../log';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { createSimulator } from './createSimulator';
import { createValidateRecord } from './createValidateRecord';
import { enableLog } from './enableLog';
import { createStub } from './stubing';
import { Spec, SpecOptions } from './types';
import { prettyPrintSpecRecord } from './prettyPrintSpecRecord';

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
    },
    enableLog,
    logSpecRecord() {
      log.info('loaded\n', prettyPrintSpecRecord(loaded))
      log.info('actual\n', prettyPrintSpecRecord(record.actual))
    }
  })
}
