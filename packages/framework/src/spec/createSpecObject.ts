import { AsyncContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { createSpec } from './createSpec'
import { Spec } from './types'

export function createSpecObject(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string
}>, specName: string, options: Spec.Options) {
  let s: Spec
  type InitState = { enableLog: boolean, ignoreValues: any[], logLevel?: LogLevel }
  const initState: InitState = { enableLog: false, ignoreValues: [] }
  async function createActualSpec(initState: InitState) {
    if (s) return s
    const { mode, specRelativePath } = await context.get()
    s = await createSpec(context, specName, specRelativePath, mode, options)
    initState.ignoreValues.forEach(v => s.ignoreMismatch(v))
    if (initState.enableLog) s.enableLog(initState.logLevel)
    return s
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
    ignoreMismatch(value: any) { initState.ignoreValues.push(value) }
  }) as any
  return spec
}
