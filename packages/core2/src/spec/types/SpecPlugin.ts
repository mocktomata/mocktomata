import { Meta } from './Meta';
import { ActionMode } from './SpecRecord';

export interface SpecPlugin<S = any, M extends Record<string, any> = never> {
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
  createSpy(context: SpyContext, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: StubContext, meta: M): S,
  /**
   *
   */
  createAutomaton(): void,
  /**
   * Creates an imitator that simulates the behavior of the original subject.
   * Imitator is used when the subject is created during the spec.
   * Since the original subject does not come from the spec caller,
   * the imitator is created to imitate the original subject.
   */
  createImitator(context: any, meta: M): void,
}

export type SpyOptions = {
  mode: ActionMode,
  // meta?: Meta
}

export type SpyContext = {
  declare<S>(spy: S, meta?: Meta): SpyRecorder,
  getSpy<S>(subject: S, options: SpyOptions): S
}

export type InvokeOptions = {
  mode?: ActionMode,
  transform?: <A>(arg: A) => A,
  meta?: Meta
}
export type SpyRecorder = {
  invoke(args: any[], options?: InvokeOptions): InvocationRecorder
}

export type InvocationRecorder = {
  returns<V>(value: V, options?: InvokeOptions): V,
  throws<E>(err: E, options?: InvokeOptions): E
}

export type StubContext = {
  declare<S>(stub: S, meta?: Meta): StubRecorder
}

export type StubRecorder = {}
