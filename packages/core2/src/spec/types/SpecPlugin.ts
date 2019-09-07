import { Meta } from './Meta';
import { ActionMode } from './SpecRecord';

export interface SpecPlugin<S = any, M extends Record<string, any> = any> {
  /**
   * Name of the plugin. This is needed only if there are multiple plugins in a package.
   */
  name?: string,
  /**
   * Indicates if the plugin can handle the specified subject.
   */
  support(subject: any): boolean,
  /**
   * Creates a spy that captures the interactions with the specified subject.
   * @param context Provides tools needed to record the subject's behavior.
   * @param subject The subject to spy.
   */
  createSpy(context: SpyContext<S>, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: StubContext<S>, meta: M): S,
  recreateSubject?(context: {}, meta: M): S,
  // /**
  //  *
  //  */
  // createAutomaton(): void,
  /**
   * Creates an imitator that simulates the behavior of the original subject.
   * Imitator is used when the subject is created during the spec.
   * Since the original subject does not come from the spec caller,
   * the imitator is created to imitate the original subject.
   */
  createImitator?(context: any, meta: M): S,
}

export type DeclareOptions = {
  /**
   * Meta used to recreate the subject during simulation.
   */
  meta?: any
}

export type SpyContext<S> = {
  declare(spy: S, options?: DeclareOptions): SpyRecorder<S>,
  getSpy<A>(subject: A, options: SpyOptions): A
}

export type SpyOptions = {
  mode: ActionMode,
  // meta?: Meta
}

export type SpyRecorder<S> = {
  spy: S,
  invoke(args: any[], options?: SpyInvokeOptions): InvocationRecorder
}

export type SpyInvokeOptions = {
  mode?: ActionMode,
  transform?: <A>(arg: A) => A,
  meta?: Meta
}

export type InvocationRecorder = {
  args: any[],
  returns<V>(value: V, options?: SpyInvokeOptions): V,
  throws<E>(err: E, options?: SpyInvokeOptions): E
}

export type StubContext<S> = {
  declare(stub: S, meta?: Meta): StubRecorder<S>,
  getStub<A>(subject: A): A,
}

export type StubRecorder<S> = {
  stub: S,
  invoke(args: any[], options?: StubInvokeOptions): InvocationResponder
}

export type StubInvokeOptions = {
  transform?: <A>(arg: A) => A,
}

export type InvocationResponder = {
  getResult(): { type: 'return' | 'throw', value: any },
  getResultAsync(): Promise<{ type: 'return' | 'throw', value: any }>,
}
