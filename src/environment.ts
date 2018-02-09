import { DuplicateEnvironmentHandler, MissingEnvironmentHandler } from './errors'
import { EnvironmentMode } from './interfaces'
import { spec, SpecFn } from './spec'
import { store } from './store'

function findMatchingEntry(clause: string) {
  return store.envEntries.find(entry => {
    return entry.clause instanceof RegExp && entry.clause.test(clause) ||
      entry.clause === clause
  })
}
const envFixtures = new WeakMap()
async function runHandler(envContext, entry) {
  if (envFixtures.has(entry))
    return envFixtures.get(entry)

  const fixture = (await entry.handler(envContext)) || {}
  envFixtures.set(entry, fixture)
  return fixture
}

async function createEnvironment<T>(envContext: EnvironmentContext, clause, localHandler) {
  const entry = findMatchingEntry(clause)
  if (entry) {
    if (localHandler)
      throw new DuplicateEnvironmentHandler(clause)
    const fixture = await runHandler(envContext, entry)
    return { ...envContext, fixture } as Environment<T>
  }
  else {
    if (localHandler) {
      const fixture = (await localHandler(envContext)) || {}
      return { ...envContext, fixture } as Environment<T>
    }

    throw new MissingEnvironmentHandler(clause)
  }
}


export const environment = Object.assign(
  async function environment<T = any>(
    clause: string,
    localHandler?: (context: EnvironmentContext) => any
  ): Promise<Environment<T>> {
    return createEnvironment<T>(getContext(clause, 'live'), clause, localHandler)
  }, {
    simulate<T = any>(
      clause: string,
      localHandler?: (context: EnvironmentContext) => any
    ): Promise<Environment<T>> {
      return createEnvironment<T>(getContext(clause, 'simulate'), clause, localHandler)
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
  const entry = store.envEntries.find(entry => {
    return entry.clause.toString() === clause.toString()
  })
  if (entry)
    throw new DuplicateEnvironmentHandler(clause)

  store.envEntries.push({ clause, handler })
}
