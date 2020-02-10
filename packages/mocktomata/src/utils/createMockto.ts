import { createSpec, Spec, SpecContext } from '@mocktomata/framework'
import { Context as AsyncContext } from 'async-fp'
import { Store } from 'global-store'
import { LogLevel } from 'standard-log'
import { WorkerStore } from '../types'
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
  export type Context<S> = {
    initializeContext: (store: Store<S>) => AsyncContext<SpecContext>,
    store: Store<S>
  }
  export interface SpecFn {
    (specName: string, handler: Spec.Handler): void,
    (specName: string, options: Spec.Options, handler: Spec.Handler): void,
  }
}

export function createMockto<S extends WorkerStore>(context: Mockto.Context<S>) {
  return Object.assign(
    createSpecFn(context, 'auto'),
    {
      live: createSpecFn(context, 'live'),
      save: createSpecFn(context, 'save'),
      simulate: createSpecFn(context, 'simulate'),
      start,
    }
  )
}

function createSpecFn<S>({ initializeContext, store }: Mockto.Context<S>, defaultMode: Spec.Mode): Mockto.SpecFn {
  const fn = (...args: any[]): any => {
    const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
    const specRelativePath = getCallerRelativePath(fn)
    let s: Promise<Spec>
    // this is used to avoid unhandled promise error
    function createSpecWithHandler() {
      if (s) return s
      const context = initializeContext(store)
      const mode = getEffectiveSpecMode(store.value, defaultMode, specName, specRelativePath)
      return s = createSpec(context, specName, specRelativePath, mode, options)
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

function resolveMocktoFnArgs(args: any[]): { specName: string, options: Spec.Options | undefined, handler: Spec.Handler } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}
