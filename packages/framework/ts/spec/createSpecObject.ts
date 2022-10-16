import type { AsyncContext } from 'async-fp'
import { LogLevel, logLevels } from 'standard-log'
import { createSpec } from './createSpec.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'
import type { Spec } from './types.js'

export function createSpecObject(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string,
}>, specName: string, options: Spec.Options) {
  const { spec, modeProperty: mode, enableLog, ignoreMismatch, maskValue, done } = createSpecFns(context, specName, options)
  return Object.assign(Object.defineProperties(spec, { mode }), { enableLog, ignoreMismatch, maskValue, done }) as any
}

export function createSpecFns(context: AsyncContext<Spec.Context & {
  mode: Spec.Mode,
  specRelativePath: string,
}>, specName: string, options: Spec.Options) {
  let s: Spec | undefined
  type InitState = { enableLog: boolean, ignoreValues: any[], maskCriteria: any[], logLevel?: LogLevel }
  const initState: InitState = { enableLog: false, ignoreValues: [], maskCriteria: [] }
  async function createActualSpec(initState: InitState) {
    if (s) return s
    const { mode, specRelativePath } = await context.get()
    const spec = s = await createSpec(context, specName, specRelativePath, mode, options)
    if (initState.enableLog) spec.enableLog(initState.logLevel)
    initState.ignoreValues.forEach(v => spec.ignoreMismatch(v))
    initState.maskCriteria.forEach(v => spec.maskValue(v.value, v.replaceWith))
    return spec
  }
  const { resolve, promise } = defer<Spec>()

  function enableLog(level: LogLevel = logLevels.all) {
    if (s) s.enableLog(level)
    else {
      initState.enableLog = true
      initState.logLevel = level
    }
  }
  function ignoreMismatch(value: any) {
    if (s) throw new InvokeMetaMethodAfterSpec('ignoreMismatch')
    else initState.ignoreValues.push(value)
  }
  function maskValue(value: any, replaceWith: any) {
    if (s) throw new InvokeMetaMethodAfterSpec('maskValue')
    initState.maskCriteria.push({ value, replaceWith })
  }

  let actualMode: Spec.Mode
  const modeProperty = {
    get() { return actualMode }
  }
  function done() { return promise.then(s => s.done()) }
  const spec = (subject: any) => createActualSpec(initState).then(actualSpec => {
    actualMode = actualSpec.mode
    resolve(actualSpec)
    return actualSpec(subject)
  })
  return { spec, modeProperty, enableLog, ignoreMismatch, maskValue, done }
}

function defer<T>() {
  let resolve: (value: T | PromiseLike<T>) => void
  let reject: (reason?: any) => void
  const promise = new Promise<T>((a, r) => {
    resolve = a
    reject = r
  })

  return { resolve: resolve!, reject: reject!, promise }
}
