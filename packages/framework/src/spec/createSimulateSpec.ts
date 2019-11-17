import { SpecContext } from '../context';
import { log } from '../log';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
// import { createSimulator } from './createSimulator';
// import { createValidateRecord } from './createValidateRecord';
import { enableLog } from './enableLog';
// import { createStub } from './stubing';
import { Spec, SpecOptions } from './types';
import { prettyPrintSpecRecord } from './prettyPrintSpecRecord';
import { createSimulator } from './simulator';

export async function createSimulateSpec(context: SpecContext, specName: string, invokePath: string, options: SpecOptions): Promise<Spec> {
  assertSpecName(specName)

  const loaded = await context.io.readSpec(specName, invokePath)

  const simulator = createSimulator(specName, loaded, options)

  return Object.assign(
    async (subject: any) => {
      assertMockable(subject)
      return simulator.createStub(subject, { mode: 'passive' })
    }, {
    async done() {
      simulator.end()
    },
    enableLog,
    getSpecRecord: () => Promise.resolve(simulator.getSpecRecord()),
    logSpecRecord() {
      log.info('loaded\n', prettyPrintSpecRecord(loaded))
      log.info('actual\n', prettyPrintSpecRecord(simulator.getSpecRecord()))
    }
  })
}
