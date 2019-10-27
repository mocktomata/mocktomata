import { Meta } from './Meta';
import { ActionId, ActionMode, ReferenceId } from './SpecRecord';

export type SpecPlugin<S = any, M extends Record<string, any> = any> = {
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
  createSpy(context: SpecPlugin.CreateSpyContext, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: SpecPlugin.CreateStubContext, subject: S, meta: M): S,
  /**
   * Converts the spy to meta data that can be used during simulation to simulate the behavor.
   */
  metarize?(context: { metarize(subject: any): void }, spy: S): M,
  recreateSubject?(context: {}, meta: M): S,
  /**
   * Creates an imitator that simulates the behavior of the original subject.
   * Imitator is used when the subject is created during the spec.
   * Since the original subject does not come from the spec caller,
   * the imitator is created to imitate the original subject.
   */
  createImitator?(context: any, meta: M): S,
}
export namespace SpecPlugin {
  export type CreateSpyContext = {
    invoke(args: any[], options?: InvokeOptions): InvocationRecorder,
    instantiate(args: any[], options?: InstantiateOptions): InstantiationRecorder,
    getSpy<S>(subject: S, options?: GetSpyOptions): S,
  }

  export type CreateStubContext = {
    invoke(args: any[], options?: InvokeOptions): InvocationResponder,
    instantiate(args: any[], options?: InstantiateOptions): InstantiationResponder,
    getSpy<S>(subject: S, options?: GetSpyOptions): S,
    resolve<V>(refIdOrValue: V, options?: ResolveOptions): V,
  }

  export type GetSpyOptions = {
    /**
     * Specifies the action mode fo the spy.
     *
     * If specified, this mode will be used instead of the one specified by the spy's plugin.
     *
     * This allows the current plugin to describe how the spy is being used in the current context.
     */
    mode?: ActionMode,
    /**
     * Specifies where the spy is located from the current subject.
     *
     * This can only be specified when `getSpy()` is called in the plugin context.
     *
     * i.e. not within the `processArgument(s)` callbacks.
     */
    site?: Array<string | number>
  }

  export type InvokeOptions = {
    mode?: ActionMode,
    processArguments?: <A>(arg: A) => A,
    site?: Array<string | number>,
    meta?: Meta,
  }

  export type SpyResultOptions = {
    processArgument?: <A>(arg: A) => A,
    meta?: Meta,
  }

  export type InvocationRecorder = {
    args: any[],
    returns<V>(value: V, options?: SpyResultOptions): V,
    throws<E>(err: E, options?: SpyResultOptions): E
  }

  export type InvocationResponder = {
    getResult(): { type: 'return' | 'throw', value: any, meta: Meta | undefined },
    getResultAsync(): Promise<{ type: 'return' | 'throw', value: any, meta: Meta | undefined }>,
    returns<V>(value: V): V,
    throws<V>(value: V): V,
  }

  export type InstantiateOptions = {
    mode?: ActionMode,
    processArguments?: <A>(id: ActionId, arg: A) => A,
    meta?: Meta,
  }

  export type InstantiationRecorder = {
    args: any[],
    setInstance(instance: any): ReferenceId,
    invoke(args: any[], options?: InvokeOptions): InvocationRecorder,
  }

  export type InstantiationResponder = {
    args: any[],
    setInstance(instance: any): ReferenceId,
    invoke(args: any[], options?: InvokeOptions): InvocationResponder,
  }

  export type ResolveOptions = {
    site?: Array<string | number>
  }
}
