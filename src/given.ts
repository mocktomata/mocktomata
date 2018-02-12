import { GivenSaveRequireSpecId, DuplicateGivenHandler, MissingGivenHandler } from './errors'
import { GivenMode } from './interfaces'
import { io } from './io'
import { spec, SpecFn } from './spec'
import { store } from './store'

function findMatchingEntry(clause: string) {
  return store.givenEntries.find(entry => {
    return entry.clause instanceof RegExp && entry.clause.test(clause) ||
      entry.clause === clause
  })
}
const simFixtures = new WeakMap()
const liveFixtures = new WeakMap()

async function runHandler(envContext, entry) {
  const fixtures = envContext.mode === 'live' ? liveFixtures : simFixtures
  if (fixtures.has(entry))
    return fixtures.get(entry)

  const fixture = (await entry.handler(envContext)) || {}
  fixtures.set(entry, fixture)
  return fixture
}

async function createGiven<T>(envContext: GivenContext, clause, localHandler) {
  let entry = findMatchingEntry(clause)
  if (entry && localHandler)
    throw new DuplicateGivenHandler(clause)
  if (!entry && !localHandler)
    throw new MissingGivenHandler(clause)

  entry = entry || { clause, handler: localHandler }
  const fixture = await runHandler(envContext, entry)
  return { ...envContext, fixture } as Given<T>
}

export const given = Object.assign(
  async function given<T = any>(
    clause: string,
    localHandler?: (context: GivenContext) => any
  ): Promise<Given<T>> {
    return createGiven<T>(getContext(clause, 'live'), clause, localHandler)
  },
  {
    simulate<T = any>(
      clause: string,
      localHandler?: (context: GivenContext) => any
    ): Promise<Given<T>> {
      return createGiven<T>(getContext(clause, 'simulate'), clause, localHandler)
    },
    async save<T = any>(
      clause: string,
      localHandler?: (context: GivenContext) => any
    ): Promise<Given<T>> {
      const specsCreated: string[] = []

      const saveSpecFn = function (id, subject) {
        if (typeof id !== 'string')
          throw new GivenSaveRequireSpecId(clause)
        specsCreated.push(id)
        return spec.save(id, subject)
      }

      const simSpecFn = function (id, subject) {
        specsCreated.push(id)
        return spec.simulate(id, subject)
      }
      const saveSpec = Object.assign(saveSpecFn, { save: saveSpecFn, simulate: simSpecFn })
      const envContext = { mode: 'save', spec: saveSpec }

      let entry = findMatchingEntry(clause)
      if (entry && localHandler)
        throw new DuplicateGivenHandler(clause)
      if (!entry && !localHandler)
        throw new MissingGivenHandler(clause)

      entry = entry || { clause, handler: localHandler }
      const fixture = await runHandler(envContext, entry)

      await io.writeGiven(clause, { specs: specsCreated })
      return { ...envContext, fixture } as Given<T>
    }
  }
)

const liveContext = { mode: 'live', spec } as any
const simSpec = Object.assign(spec.simulate, { save: spec.save, simulate: spec.simulate })
const simulateContext = { mode: 'simulate', spec: simSpec } as any

export interface GivenContext {
  mode: GivenMode,
  spec: SpecFn
}

export interface Given<T> extends GivenContext {
  fixture: T
}

function getEffectiveModel(clause: string, mode: GivenMode) {
  const override = store.envOverrides.find(s => {
    if (typeof s.filter === 'string')
      return s.filter === clause
    else
      return s.filter.test(clause)
  })
  return override ? override.mode :
    store.envDefaultMode || mode

}
function getContext(clause: string, mode: GivenMode) {
  const effectiveMode = getEffectiveModel(clause, mode)

  if (effectiveMode === 'live')
    return liveContext
  if (effectiveMode === 'simulate')
    return simulateContext
}

export function onGiven(clause: string | RegExp, handler: (context: GivenContext) => any) {
  const entry = store.givenEntries.find(entry => {
    return entry.clause.toString() === clause.toString()
  })
  if (entry)
    throw new DuplicateGivenHandler(clause)

  store.givenEntries.push({ clause, handler })
}
