import merge from 'lodash.merge'

import { MissingClauseHandler } from './errors'
import { ExecutionModes } from './interfaces'
import { store } from './store'
import { spec } from './spec'

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
  if (entries.length === 0)
    throw new MissingClauseHandler(clause)

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
    // tslint:disable-next-line
    return runEnvironment(realContext, clause, listener)
  }, {
    simulate<T = any>(
      clause: string,
      listener?: (context: EnvironmentContext) => any
    ): Promise<T> {
      // tslint:disable-next-line
      return runEnvironment(simulateContext, clause, listener)
    }
  })
export interface EnvironmentContext {
  mode: ExecutionModes,
  environment: typeof environment
}

const realContext = { mode: 'real', environment, spec } as any

const simEnvironment = Object.assign(environment.simulate, { simulate: environment.simulate })
const simulateContext = { mode: 'simulate', environment: simEnvironment } as any

export function onEnvironment(clause: string | RegExp, handler: (context: EnvironmentContext) => any) {
  store.envEntries.push({ clause, handler })
}
