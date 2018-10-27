import { create } from 'global-store'
import { SpecMode } from 'komondor-plugin';
import { KomondorOptions } from './interfaces';

export interface KomondorStore {
  options: KomondorOptions
  scenarioDefaultMode: SpecMode | undefined
  scenarioOverrides: { mode: SpecMode, filter: string | RegExp }[]
  specDefaultMode: SpecMode | undefined
  specOverrides: { mode: SpecMode, filter: string | RegExp }[]
}

function createDefault(): KomondorStore {
  return {
    options: {},
    scenarioDefaultMode: undefined,
    scenarioOverrides: [],
    specDefaultMode: undefined,
    specOverrides: []
  }
}

export const store = create('komondor', createDefault())

// for testing only
export function resetStore() {
  store.set(createDefault())
}

// let specDefaultMode: SpecMode | undefined
// let specOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
// let envOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
// const defaultOptions = {}
// let options: KomondorOptions = { ...defaultOptions }

// export let store = {
//   artifacts: {},
//   defaultArtifacts: {},
//   defaultMode: undefined as SpecMode | undefined,
//   scenarioOverrides: [] as { mode: SpecMode, filter: string | RegExp }[],
//   specDefaultMode,
//   specOverrides,
//   steps: [] as {
//     clause: string,
//     handler: Function,
//     regex?: RegExp,
//     valueTypes?: string[]
//   }[],
//   envOverrides,
//   options
// }

// export function resetStore() {
//   store.artifacts = {}
//   store.defaultArtifacts = {}
//   store.defaultMode = undefined
//   store.scenarioOverrides = []
//   store.specDefaultMode = undefined
//   store.specOverrides = []
//   store.givenEntries = []
//   store.steps = []
//   store.envDefaultMode = undefined
//   store.envOverrides = []
//   store.options = {}
// }
