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

async function runEnvironment(envContext: EnvironmentContext, clause, listener) {
  const entries = getMatchingEntries(clause)
  if (entries.length === 0 && !listener)
    throw new MissingEnvironmentHandler(clause)

  const context = runHandlers(envContext, entries)
  if (listener) {
    const listenerContext = await listener(envContext)
    if (listenerContext)
      merge(context, listenerContext)
  }

  return context as any
}


export const environment = Object.assign(
  async function environment<T = any>(
    clause: string,
    listener?: (context: EnvironmentContext) => any
  ): Promise<T> {
    return runEnvironment(getContext(clause, 'live'), clause, listener)
  }, {
    simulate<T = any>(
      clause: string,
      listener?: (context: EnvironmentContext) => any
    ): Promise<T> {
      return runEnvironment(getContext(clause, 'simulate'), clause, listener)
    }
  }
)

const liveContext = { mode: 'live', environment, spec } as any

const simEnvironment = Object.assign(environment.simulate, { simulate: environment.simulate })
const simulateContext = { mode: 'simulate', environment: simEnvironment, spec } as any

export interface EnvironmentContext {
  mode: EnvironmentMode,
  environment: typeof environment,
  spec: SpecFn
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
