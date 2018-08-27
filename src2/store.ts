import { SpecMode } from 'komondor-plugin'
import { KomondorOptions } from './interfaces'

let specDefaultMode: SpecMode | undefined
let specOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
let envOverrides: { mode: SpecMode, filter: string | RegExp }[] = []
const defaultOptions = {}
let options: KomondorOptions = { ...defaultOptions }

export let store = {
  artifacts: {},
  defaultArtifacts: {},
  defaultMode: undefined as SpecMode | undefined,
  scenarioOverrides: [] as { mode: SpecMode, filter: string | RegExp }[],
  specDefaultMode,
  specOverrides,
  steps: [] as {
    clause: string,
    handler: Function,
    regex?: RegExp,
    valueTypes?: string[]
  }[],
  envOverrides,
  options
}
