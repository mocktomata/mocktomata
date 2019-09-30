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
  /**
   * Converts the spy to meta data that can be used during simulation to simulate the behavor.
   */
  metarize?(context: { metarize(subject: any): void }, spy: S): M,
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
  meta?: any,
  transform?: <A>(spy: A) => A,
}

export type SpyContext<S> = {
  invoke(args: any[], options?: SpyInvokeOptions): InvocationRecorder,
  getSpy<A>(subject: A, options?: Partial<SpyOptions>): A,
}

export type SpyOptions = {
  mode?: ActionMode,
  site?: Array<string | number>
  // meta?: Meta
}

export type SpyRecorder<S> = {
  spy: S,
  invoke(args: any[], options?: SpyInvokeOptions): InvocationRecorder
}

export type SpyInvokeOptions = {
  mode?: ActionMode,
  transform?: <A>(arg: A) => A,
  // TODO: the invoke site probably should not be number (as least the last element).
  // because if last element is a number, it means that (should) be an element in an array,
  // and that means that element should have its own spy and should not need this site.
  // Currently, this is used only by promisePlugin to invoke the `then` method.
  // I don't see other usage of it yet.
  site?: Array<string | number>,
  meta?: Meta,
}

export type SpyResultOptions = {
  transform?: <A>(arg: A) => A,
  // site?: Array<string | number>,
  meta?: Meta,
}

export type InvocationRecorder = {
  args: any[],
  returns<V>(value: V, options?: SpyInvokeOptions): V,
  throws<E>(err: E, options?: SpyInvokeOptions): E
}

export type StubOptions = {
  site?: Array<string | number>
  // meta?: Meta
}

export type StubContext<S> = {
  invoke(args: any[], options?: StubInvokeOptions): InvocationResponder,
  getSpy<A>(subject: A, options?: Partial<SpyOptions>): A,
  resolve<V>(refIdOrValue: V, options?: StubOptions): V,
}

export type StubRecorder<S> = {
  stub: S,
  invoke(args: any[], options?: StubInvokeOptions): InvocationResponder
}

export type StubInvokeOptions = {
  transform?: <A>(arg: A) => A,
  site?: Array<string | number>,
}

export type InvocationResponder = {
  getResult(): { type: 'return' | 'throw', value: any, meta: Meta | undefined },
  getResultAsync(): Promise<{ type: 'return' | 'throw', value: any, meta: Meta | undefined }>,
  returns<V>(value: V): V,
  throws<V>(value: V): V,
}
