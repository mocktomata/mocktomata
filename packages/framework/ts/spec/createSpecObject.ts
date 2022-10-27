import type { AsyncContext } from 'async-fp'
import { LogLevel } from 'standard-log'
import { createSpec } from './createSpec.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'
import type { Spec } from './types.js'

export function createSpecObject(context: AsyncContext<Spec.Context>) {
  const { spec, modeProperty: mode, ignoreMismatch, maskValue, done } = createSpecFns(context)
  return Object.assign(Object.defineProperties(spec, { mode }), { ignoreMismatch, maskValue, done }) as any
}

export function createSpecFns(context: AsyncContext<Spec.Context>) {
  let s: Spec | undefined
  type InitState = { enableLog: boolean, ignoreValues: any[], maskCriteria: any[], logLevel?: LogLevel }
  const initState: InitState = { enableLog: false, ignoreValues: [], maskCriteria: [] }
  async function createActualSpec(initState: InitState) {
    if (s) return s
    const { mode, specName, options, specRelativePath } = await context.get()
    const spec = s = await createSpec(context, specName, specRelativePath, mode, options)
    // if (initState.enableLog) spec.enableLog(initState.logLevel)
    initState.ignoreValues.forEach(v => spec.ignoreMismatch(v))
    initState.maskCriteria.forEach(v => spec.maskValue(v.value, v.replaceWith))
    return spec
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
  let actualSpec: Spec
  function done() {
    if (actualSpec) return actualSpec.done()
    // spec can be not used at all,
    // e.g. in `scenario`.
    return createActualSpec(initState).then(a => a.done())
  }
  const spec = (subject: any) => createActualSpec(initState).then(aspec => {
    actualSpec = aspec
    actualMode = aspec.mode
    return aspec(subject)
  })
  return { spec, modeProperty, ignoreMismatch, maskValue, done }
}
