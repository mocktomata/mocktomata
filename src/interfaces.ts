import { Logger } from '@unional/logging'
import { Expectation } from 'satisfier'

export type SpecMode = 'verify' | 'save' | 'replay'

export interface KomondorOptions {
  mode: SpecMode,
  spec: string | RegExp
}

export interface Spy<T> {
  on(event: string, callback: (action: SpecAction) => void),
  onAny(callback: (action: SpecAction) => void),
  actions: SpecAction[],
  subject: T
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
  next(): void,
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
  on(actionType: string, callback: Function),
  onAny(callback: Function),
}

export interface SpecContext extends SpecRecorder, SpecPlayer {
  mode: SpecMode,
  id: string
}

export interface SpecPluginUtil {
  getSpy<T = any>(context: SpecContext, subject: T): T,
  getStub<T = any>(context: SpecContext, subject: T, id: string): T,
  /**
   * @scope Scope of the spec.
   * This will be used as prefix in `action.type` so that the respective spec and handles the result.
   */
  getReturnSpy<T = any>(context: SpecContext, subject: T, scope: string): T,
  getReturnStub(context: SpecContext, action: SpecAction): any,
  log: Logger
}

export interface WebSocketSpecRecord {
  actions: SpecAction[],
  expectation: string
}

