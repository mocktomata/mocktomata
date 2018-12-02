import { SpecAction, SpecMode } from 'komondor-plugin'
import { ArrayEntryExpectation } from 'satisfier'

export type GivenMode = 'live' | 'save' | 'simulate'

export interface KomondorOptions {
  plugins?: string[]
}

export interface Spy<T> {
  mode: SpecMode,
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
  id: string,
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: Array<Partial<SpecAction> | ArrayEntryExpectation | undefined> | ((arr: any[]) => boolean)): Promise<void>,
  done(): Promise<void>
}

export interface GivenRecord {
  specs?: string[]
}
