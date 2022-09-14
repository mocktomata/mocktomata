import { AsyncContext } from 'async-fp'
import { LogLevel } from 'standard-log'
import { prettyPrintSpecRecord } from '../utils/index.js'
import { assertMockable } from './assertMockable.js'
import { assertSpecName } from './assertSpecName.js'
import { createRecorder } from './recorder.js'
import { Spec } from './types.js'
import { createSpec } from './types-internal.js'

export async function createSaveSpec(
  context: AsyncContext<createSpec.Context>,
  specName: string,
  invokePath: string,
  options: Spec.Options
): Promise<Spec> {
  assertSpecName(specName)

  const recorder = createRecorder(context, specName, options)
  let origLogLevel: LogLevel | false | undefined = false

  return Object.assign(
    async <S>(subject: S) => {
      assertMockable(subject)
      return recorder.createSpy<S>(subject)
    },
    {
      get mode() { return 'save' as const },
      async done() {
        recorder.end()
        const { io, maskCriteria, log } = await context.get()
        const record = recorder.getSpecRecord(maskCriteria)
        io.writeSpec(specName, invokePath, record)
        if (origLogLevel !== false) {
          log.debug(`Spec Record "${specName}":`, prettyPrintSpecRecord(record))
          log.level = origLogLevel
        }
      },
      async enableLog(level?: LogLevel) {
        const { log } = await context.get()
        origLogLevel = log.level
        log.level = level
      },
      ignoreMismatch(value: any) {
        const valueType = typeof value
        if (valueType !== 'bigint' && valueType !== 'boolean' && valueType !== 'number') return
        recorder.addInertValue(value)
      },
      maskValue(value: any, replaceWith?: any) {
        recorder.addMaskValue(value, replaceWith)
      },
    })
}
