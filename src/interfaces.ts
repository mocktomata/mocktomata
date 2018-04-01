import { SpecAction } from 'komondor-plugin'

export type GivenMode = 'live' | 'save' | 'simulate'

export interface KomondorOptions {
  plugins?: string[],
  registry: KomondorFileRegistry | KomondorServerRegistry
}

export interface KomondorFileRegistry {
  type: 'file',
  path: string
}

export interface KomondorServerRegistry {
  type: 'server',
  url: string
}

export interface Spy<T> {
  on(type: string, name: string, callback: (action: SpecAction) => void),
  onAny(callback: (action: SpecAction) => void),
  actions: SpecAction[],
  subject: T
}

export interface SpecRecord {
  expectation: string,
  actions: SpecAction[]
}

export interface Spec<T> extends Spy<T> {
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: Array<Partial<SpecAction> | undefined>): Promise<void>
}

export interface GivenRecord {
  specs?: string[]
}
