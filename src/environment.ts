import merge from 'lodash.merge'

import { MissingEnvironmentHandler } from './errors'
import { EnvironmentMode } from './interfaces'
import { store } from './store'
import { spec, SpecFn } from './spec'

function getMatchingEntries(clause: string) {
  return store.envEntries.filter(entry => {
    return entry.clause instanceof RegExp && entry.clause.test(clause) ||
      entry.clause === clause
  })
}

function runHandlers(envContext, entries) {
  const context = {}
  entries.filter(e => !e.invoked).map(async e => {
    e.invoked = true
    const localContext = await e.handler(envContext)
    if (localContext)
      merge(context, localContext)
  })
  return context
}

async function createEnvironment<T>(envContext: EnvironmentContext, clause, listener) {
  const entries = getMatchingEntries(clause)
  if (entries.length === 0 && !listener)
    throw new MissingEnvironmentHandler(clause)

  const fixture = runHandlers(envContext, entries)
  if (listener) {
    const listenerContext = await listener(envContext)
    if (listenerContext)
      merge(fixture, listenerContext)
  }

  return { ...envContext, fixture } as Environment<T>
}


export const environment = Object.assign(
  async function environment<T = any>(
    clause: string,
    listener?: (context: EnvironmentContext) => any
  ): Promise<Environment<T>> {
    return createEnvironment<T>(getContext(clause, 'live'), clause, listener)
  }, {
    simulate<T = any>(
      clause: string,
      listener?: (context: EnvironmentContext) => any
    ): Promise<Environment<T>> {
      return createEnvironment<T>(getContext(clause, 'simulate'), clause, listener)
    }
  }
)

const liveContext = { mode: 'live', spec } as any
const simSpec = Object.assign(spec.simulate, { save: spec.save, simulate: spec.simulate })
const simulateContext = { mode: 'simulate', spec: simSpec } as any

export interface EnvironmentContext {
  mode: EnvironmentMode,
  spec: SpecFn
}

export interface Environment<T> extends EnvironmentContext {
  fixture: T
}

function getContext(clause: string, mode: EnvironmentMode) {
  const override = store.envOverrides.find(s => {
    if (typeof s.filter === 'string')
      return s.filter === clause
    else
      return s.filter.test(clause)
  })
  const actualMode = override ? override.mode :
    store.envDefaultMode || mode

  if (actualMode === 'live')
    return liveContext
  if (actualMode === 'simulate')
    return simulateContext
}

export function onEnvironment(clause: string | RegExp, handler: (context: EnvironmentContext) => any) {
  store.envEntries.push({ clause, handler })
}
