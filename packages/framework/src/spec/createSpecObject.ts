import { AsyncContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { createSpec } from './createSpec'
import { Spec } from './types'
import { InvokeMetaMethodAfterSpec } from './errors'

export function createSpecObject(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string
}>, specName: string, options: Spec.Options) {
  let s: Spec | undefined
  type InitState = { enableLog: boolean, ignoreValues: any[], maskValues: any[], logLevel?: LogLevel }
  const initState: InitState = { enableLog: false, ignoreValues: [], maskValues: [] }
  async function createActualSpec(initState: InitState) {
    if (s) return s
    const { mode, specRelativePath } = await context.get()
    const spec = s = await createSpec(context, specName, specRelativePath, mode, options)
    if (initState.enableLog) spec.enableLog(initState.logLevel)
    initState.ignoreValues.forEach(v => spec.ignoreMismatch(v))
    initState.maskValues.forEach(v => spec.maskValue(v.value, v.replaceWith))
    return spec
  }

  const spec = Object.assign((subject: any) => createActualSpec(initState).then(actualSpec => {
    if (!spec.mode) {
      Object.defineProperties(spec, {
        mode: {
          get() { return actualSpec.mode }
        },
        done: {
          configurable: false,
          value: actualSpec.done,
          writable: false
        }
      })
    }
    return actualSpec(subject)
  }), {
    enableLog: (level: LogLevel = logLevels.all) => {
      if (s) s.enableLog(level)
      else {
        initState.enableLog = true
        initState.logLevel = level
      }
    },
    ignoreMismatch(value: any) {
      if (s) throw new InvokeMetaMethodAfterSpec('ignoreMismatch')
      else initState.ignoreValues.push(value)
    },
    maskValue(value: any, replaceWith: any) {
      if (s) throw new InvokeMetaMethodAfterSpec('maskValue')
      initState.maskValues.push({ value, replaceWith })
    }
  }) as any
  return spec
}
