import { FluxStandardAction } from 'flux-standard-action';
import { Expectation } from 'satisfier'

import { Spy } from './spy'

export type SpecMode = 'verify' | 'save' | 'replay'

export interface KomondorOptions {
  mode: SpecMode,
  spec: string | RegExp
}

export interface SpecOptions {
  /**
   * ID of the spec.
   */
  id: string
  /**
   * Mode of the spec operating in.
   * `verify`: making real calls and verify in `satisfy()`.
   * `save`: making real calls and save the result in file.
   * `replay`: replay calls from file.
   */
  mode: SpecMode
}

export interface SpecRecord {
  id: string,
  expectation: string,
  actions: FluxStandardAction<any, any>[]
}

export interface WebSocketSpecRecord {
  actions: FluxStandardAction<any, any>[],
  expectation: string
}


export interface Spec<T> extends Spy<T> {
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: Expectation): Promise<void>
}
