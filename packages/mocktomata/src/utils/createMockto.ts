import { createSpec, Spec, SpecContext, SpecHandler, SpecMode, SpecOptions } from '@mocktomata/framework'
import { Context } from 'async-fp'
import { LogLevel } from 'standard-log'
import { store } from '../store'
import { getCallerRelativePath } from './getCallerRelativePath'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'
import { start } from './start'

export type Mockto = Mockto.SpecFn & {
  live: Mockto.SpecFn,
  save: Mockto.SpecFn,
  simulate: Mockto.SpecFn,
  start: typeof start,
}

export namespace Mockto {
  export interface SpecFn {
    (specName: string, handler: SpecHandler): void,
    (specName: string, options: SpecOptions, handler: SpecHandler): void,
  }
}

export function createMockto(asyncSpecContext: Context<SpecContext>) {
  return Object.assign(
    createSpecFn(asyncSpecContext, 'auto'),
    {
      live: createSpecFn(asyncSpecContext, 'live'),
      save: createSpecFn(asyncSpecContext, 'save'),
      simulate: createSpecFn(asyncSpecContext, 'simulate'),
      start,
    }
  )
}

function createSpecFn(asyncSpecContext: Context<SpecContext>, defaultMode: SpecMode): Mockto.SpecFn {
  const fn = (...args: any[]): any => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const specRelativePath = getCallerRelativePath(fn)
    const mode = getEffectiveSpecMode(store.value, defaultMode, specName, specRelativePath)
    let s: Promise<Spec>
    // this is used to avoid unhandled promise error
    function createSpecWithHandler() {
      if (s) return s
      return s = createSpec(asyncSpecContext, specName, specRelativePath, mode, options)
    }
    const spec = Object.assign((subject: any) => createSpecWithHandler().then(sp => {
      spec.getSpecRecord = sp.getSpecRecord
      return sp(subject)
    }), {
      enableLog(level?: LogLevel) { createSpecWithHandler().then(sp => sp.enableLog(level)) },
      done: () => createSpecWithHandler().then(sp => sp.done())
    }) as any

    handler(specName, spec)
    return
  }
  return fn
}

function resolveMocktoFnArgs(args: any[]): { specName: string, options: SpecOptions | undefined, handler: SpecHandler } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}
