import { logLevels } from 'standard-log';
import { SpecContext } from '../context';
import { log } from '../log';
import { prettyPrintSpecRecord } from '../utils';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { createRecorder } from './recorder';
import { Spec, SpecOptions } from './types';

export async function createSaveSpec(
  context: SpecContext,
  specName: string,
  invokePath: string,
  options: SpecOptions
): Promise<Spec> {
  assertSpecName(specName)

  const recorder = createRecorder(specName, options)
  let enabledLog = false

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return recorder.createSpy<S>(subject)
    },
    {
      async done() {
        recorder.end()
        const record = recorder.getSpecRecord()
        context.io.writeSpec(specName, invokePath, record)
        if (enabledLog) {
          log.debug(`Spec Record "${specName}":`, prettyPrintSpecRecord(record))
        }
      },
      enableLog: (level = logLevels.debug) => {
        enabledLog = true
        log.level = level
      },
      getSpecRecord: () => recorder.getSpecRecord(),
    })
}
