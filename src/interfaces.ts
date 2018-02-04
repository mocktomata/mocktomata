import { Logger } from '@unional/logging'
import { getReturnSpy, getReturnStub } from './index';

export type SpecMode = 'verify' | 'save' | 'replay'

export interface RemoteStoreOptions {
  url: string
}

export interface KomondorOptions {
  mode: SpecMode,
  spec: string | RegExp,
  store: RemoteStoreOptions
}

export type ExecutionModes = 'real' | 'simulate'

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

export interface ReturnActionBase {
  type: string,
  meta: { [k: string]: any }
}

export interface ReturnAction {
  type: string,
  payload: any,
  meta: { returnType: string } & { [k: string]: any }
}

export interface SpecRecord {
  expectation: string,
  actions: SpecAction[]
}


export interface Spec<T> extends Spy<T> {
  /**
   * @param expectation Must be pure.
   */
  satisfy(expectation: any): Promise<void>
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
export type getSpy = (context: SpecContext, subject: any) => any
export type getStub = (context: SpecContext, subject: any, id: string) => any
export type getReturnSpy = (context: SpecContext, subject: any, action: ReturnActionBase) => any
export type getReturnStub = (context: SpecContext, action: SpecAction) => any

export interface KomondorRegistrar {
  registerGetSpy(getSpy: getSpy): void,
  registerGetStub(getStub: getStub): void,
  registerGetReturnSpy(getReturnSpy: getReturnSpy): void,
  registerGetReturnStub(getReturnStub: getReturnStub): void
}
export interface SpecPluginUtil {
  getSpy: getSpy,
  getStub: getStub,
  /**
   * @scope Scope of the spec.
   * This will be used as prefix in `action.type` so that the respective spec and handles the result.
   */
  getReturnSpy: getReturnSpy,
  getReturnStub: getReturnStub,
  log: Logger
}

export interface WebSocketSpecRecord {
  actions: SpecAction[],
  expectation: string
}

