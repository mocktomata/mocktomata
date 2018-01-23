import { Logger } from '@unional/logging'
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

export interface SpecAction {
  type: string,
  payload: any,
  meta?: any
}

export interface SpecRecord {
  expectation: string,
  actions: SpecAction[]
}


export interface Spec<T> extends Spy<T> {
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: Expectation): Promise<void>
}

export interface SpecCompleter {
  /**
   * Call this function to indicates the execution is completed.
   * i.e. for Spy, all relevant actions are added to the store,
   * for Stub, all relevant actions has be replayed.
   */
  resolve(): void,
}

export interface SpecRecorder {
  /**
   * Add an action to the store.
   * Used by spies.
   */
  add(action: SpecAction)
}

export interface SpecPlayer {
  /**
   * Move to the next action during replay.
   */
  next<A extends SpecAction>(): A | undefined,
  /**
   * Peep the current action during replay.
   */
  peek<A extends SpecAction>(): A | undefined,
  /**
   * Prune remaining actions during replay
   */
  prune(): void,
  /**
   * Prune remaining actions and replace with specified actions.
   */
  graft(...actions: SpecAction[]): void,
}

export interface SpecContext extends SpecCompleter, SpecRecorder, SpecPlayer { }

export interface SpecPluginUtil {
  getSpy<T = any>(context: SpecContext, subject: T): T,
  getStub<T = any>(context: SpecContext, subject: T, id: string): T,
  getReturnSpy<T = any>(context: SpecContext, subject: T): T,
  getReturnStub(context: SpecContext, type: string): any,
  log: Logger
}

export interface WebSocketSpecRecord {
  actions: SpecAction[],
  expectation: string
}

