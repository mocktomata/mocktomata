import { unpartial } from 'unpartial'

import { createCallRecordCreator } from './createCallRecordCreator'
import { CallRecord, Spec } from './interfaces'
import { SpecControl } from './private'
import { store } from './store'
import { write } from './writer'

function spyOnCallback(fn) {
  let callback
  return Object.assign(
    (...args) => {
      if (callback)
        callback(...args)
      fn(...args)
    }, {
      called(cb) {
        callback = cb
      }
    })
}

export interface SpecOptions {
  persist: boolean,
  replay: boolean
}

export interface SpecContext {
  write: typeof write
}

interface SpecUnit<T extends Function> {
  specControl: SpecControl,
  spec: Spec<T>
}

function createSpecUnit<T extends Function>(id: string, fn: T, options: SpecOptions, context: SpecContext): SpecUnit<T> {
  const calls: CallRecord[] = []
  const spiedFn: T = function (...args) {
    const creator = createCallRecordCreator(args)
    calls.push(creator.callRecord)

    const spiedCallbacks: any[] = []
    const spiedArgs = args.map(arg => {
      if (typeof arg === 'function') {
        const spied = spyOnCallback(arg)
        spiedCallbacks.push(spied)
        return spied
      }
      if (typeof arg === 'object') {
        Object.keys(arg).forEach(key => {
          if (typeof arg[key] === 'function') {
            const spied = spyOnCallback(arg[key])
            spiedCallbacks.push(spied)
            arg[key] = spied
          }
        })
      }
      return arg
    })
    if (spiedCallbacks.length > 0) {
      new Promise(a => {
        spiedCallbacks.forEach(s => {
          s.called((...results) => {
            a(results)
          })
        })
      }).then(creator.resolve, creator.reject)

      return fn(...spiedArgs)
    }
    else {
      try {
        const result = fn(...args)
        if (result && typeof result.then === 'function')
          result.then(creator.resolve, creator.reject)
        creator.callRecord.result = result
        return result
      }
      catch (error) {
        creator.callRecord.error = error
      }
    }

    if (options.persist) {
      context.write(id, calls)
    }

  } as any

  const spec: Spec<T> = {
    spiedFn,
    calls,
    save() {
      context.write(id, calls)
    }
  }

  return {
    specControl: { options, spec },
    spec
  }
}

export function createSpec<T extends Function>(id: string, fn: T, options?: Partial<SpecOptions>, context?: Partial<SpecContext>): Spec<T> {

  const { specControl, spec } = createSpecUnit(
    id,
    fn,
    unpartial({ persist: true, replay: false }, options),
    unpartial({ write }, context))
  store.specControls.push(specControl)
  return spec
}
