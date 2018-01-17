import { Expectation } from 'satisfier'

import { CallRecord } from './CallRecord'
import { Spy } from './spy'
import { FluxStandardAction } from 'flux-standard-action';

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
  description?: string
  /**
   * Mode of the spec operating in.
   * `verify`: making real calls and verify in `satisfy()`.
   * `save`: making real calls and save the result in file.
   * `replay`: replay calls from file.
   */
  mode: SpecMode
}

export interface SpecRecord {
  records: CallRecord[],
  expectation: Expectation<CallRecord[]>
}

export interface WebSocketSpecRecord {
  actions: FluxStandardAction<any, any>[],
  expectation: string
}


export interface Spec<T extends Function> extends Spy<T> {
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: Expectation): Promise<void>
}
