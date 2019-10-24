import { createSpec, Spec, SpecHandler, SpecMode, SpecOptions } from '@mocktomata/framework'
import { getCallerRelativePath } from './getCallerRelativePath'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'
import { initializeContext } from './initializeContext'
import { store } from './store'

export type Mockto = SpecFn & {
  live: SpecFn,
  save: SpecFn,
  simulate: SpecFn,
}

export interface SpecFn {
  (specName: string, options?: SpecOptions): Promise<Spec>,
  (specName: string, handler: SpecHandler): void,
  (specName: string, options: SpecOptions, handler: SpecHandler): void,
}

export const mockto: Mockto = Object.assign(
  createSpecFn('auto'), {
  live: createSpecFn('live'),
  save: createSpecFn('save'),
  simulate: createSpecFn('simulate')
})

export function createSpecFn(defaultMode: SpecMode): SpecFn {
  const fn = (...args: any[]): any => {
    initializeContext()
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const specRelativePath = getCallerRelativePath(fn)
    const mode = getEffectiveSpecMode(store.value, defaultMode, specName, specRelativePath)
    let s: Promise<Spec>
    function createSpecWithHandler() {
      if (s) return s
      return s = createSpec(specName, specRelativePath, mode, options)
    }
    if (handler) {
      handler(specName, Object.assign(
        (subject: any) => createSpecWithHandler().then(spec => spec(subject)), {
        done: () => createSpecWithHandler().then(spec => spec.done())
      }))
      return
    }
    else {
      return createSpec(specName, specRelativePath, mode, options)
    }
  }
  return fn
}

function resolveMocktoFnArgs(args: any[]): { specName: string, options: SpecOptions | undefined, handler: SpecHandler | undefined } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else if (typeof args[1] === 'function') {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
  else {
    return { specName: args[0], options: args[1], handler: undefined }
  }
}
