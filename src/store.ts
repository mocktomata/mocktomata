import { SpecMode } from 'komondor-plugin'
import { KomondorOptions, GivenMode } from './interfaces'
import { isNode } from './isNode'

export interface GivenHandlerEntry {
  clause: string | RegExp,
  handler: any,
  invoked?: true
}

let specDefaultMode: SpecMode | undefined
let specOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
let givenEntries: GivenHandlerEntry[] = []
let envDefaultMode: GivenMode | undefined
let envOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
const defaultOptions = {
  registry: isNode ?
    { type: 'file', path: '__komondor__' } :
    (() => {
      const port = process.env.PORT || 3000
      return { type: 'remote', path: `http://localhost:${port}` } as any
    })()
}
let options: KomondorOptions = { ...defaultOptions }

export let store = {
  artifacts: {},
  specDefaultMode,
  specOverrides,
  givenEntries,
  envDefaultMode,
  envOverrides,
  options
}

// for testing only
export function resetStore() {
  store.artifacts = {}
  store.specDefaultMode = undefined
  store.specOverrides = []
  store.givenEntries = []
  store.envDefaultMode = undefined
  store.envOverrides = []
  store.options = {
    registry: isNode ?
      { type: 'file', path: '__komondor__' } :
      (() => {
        const port = process.env.PORT || 3000
        return { type: 'remote', path: `http://localhost:${port}` } as any
      })()
  }
}
