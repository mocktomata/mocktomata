import { SpecContext } from '../context';
import { log } from '../log';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { prettyPrintSpecRecord } from './prettyPrintSpecRecord';
import { createRecorder } from './recorder';
// import { createSpy } from './spying';
import { Spec, SpecOptions } from './types';
import { logLevels } from 'standard-log';

export async function createSaveSpec(context: SpecContext, specName: string, invokePath: string, options: SpecOptions): Promise<Spec> {
  assertSpecName(specName)

  const recorder = createRecorder(specName, options)
  // const record = createSpyRecord(specName, options)
  let enabledLog = false

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return recorder.createSpy<S>(subject, { mode: 'passive' })!
      // return createSpy({ record, subject, mode: 'passive' })!
    }, {
    async done() {
      recorder.end()
      const record = recorder.getSpecRecord()
      context.io.writeSpec(specName, invokePath, record)
      if (enabledLog) {
        log.debug(`Spec Record "${specName}":`, prettyPrintSpecRecord(record))
      }
      // record.end()
      // const sr = record.getSpecRecord()
      // context.io.writeSpec(specName, invokePath, sr)
    },
    enableLog: (level = logLevels.debug) => {
      enabledLog = true
      log.level = level
    },
    getSpecRecord: () => recorder.getSpecRecord(),
    // getSpecRecord: () => Promise.resolve(record.getSpecRecord()),
    // logSpecRecord() { log.info(prettyPrintSpecRecord(record.getSpecRecord())) }
  })
}
