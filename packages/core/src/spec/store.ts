import { createStore } from 'global-store'

export type SpecStore = {
  defaultArtifacts: Record<string, any>
  artifacts: Record<string, any>
}

export const store = createStore<SpecStore>('@komonodr-lab/spec', { artifacts: {}, defaultArtifacts: {} })
