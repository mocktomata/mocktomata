import { Context } from 'async-fp';
import { logLevels } from 'standard-log';
import { log } from '../log';
import { prettyPrintSpecRecord } from '../utils';
import { assertMockable } from './assertMockable';
import { assertSpecName } from './assertSpecName';
import { createRecorder } from './recorder';
import { Spec, SpecContext } from './types';

export async function createSaveSpec(
  context: Context<SpecContext>,
  specName: string,
  invokePath: string,
  options: Spec.Options
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
        const record = recorder.getSpecRecord();
        const { io } = await context.get()
        io.writeSpec(specName, invokePath, record)
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
