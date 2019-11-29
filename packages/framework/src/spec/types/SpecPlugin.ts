import { Meta } from './Meta';
import { JSONTypes } from 'type-plus';
import { SpecRecord } from './SpecRecord';

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
  createSpy(context: SpecPlugin.SpyContext, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: SpecPlugin.StubContext, subject: S, meta: M): S,
  /**
   * If provided, allow you to create an additional `meta` data.
   * This `meta` data will be available when `createStub()` is called.
   * Note that this `meta` is useful only for static information,
   * i.e. information that did not change throughout the simulation.
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
  export type SpyContext = {
    setSpyOptions: setSpyOptions,
    /**
     * Set the `meta` data of the spy.
     * The `meta` data will be available when the stub is created during simulation.
     * Use this at any time during the lifetime of the spy except for class instance.
     * For class instance, use its own `setMeta()`
     * @returns the input meta.
     */
    setMeta<M extends JSONTypes>(meta: M): M,
    getProperty<V = any>(site: SpecRecord.SupportedKeyTypes[], handler: getProperty.Handler<V>, options?: getProperty.Options): V,
    invoke<V = any>(handler: invoke.Handler<V>, options?: invoke.Options): V,
    instantiate(args: any[], options?: InstantiateOptions): InstantiationRecorder,
  }

  export type setSpyOptions = <S>(subject: S, options: setSpyOptions.Options) => void
  export namespace setSpyOptions {
    export type Options = {
      plugin?: string,
      profile?: SpecRecord.SubjectProfile,
      site?: SpecRecord.SupportedKeyTypes[]
    }
  }

  export type getSpy = <S>(subject: S, options?: getSpy.Options) => S

  export namespace getSpy {
    export type Options = {
      /**
       * Specifies the action mode fo the spy.
       *
       * If specified, this mode will be used instead of the one specified by the spy's plugin.
       *
       * This allows the current plugin to describe how the spy is being used in the current context.
       */
      profile?: SpecRecord.SubjectProfile,
      /**
       * Specifies where the spy is located from the current subject.
       *
       * This can only be specified when `getSpy()` is called in the plugin context.
       *
       * i.e. not within the `processArgument(s)` callbacks.
       */
      site?: SpecRecord.SupportedKeyTypes[]
    }
  }

  export namespace getProperty {
    export type Handler<V> = (context: Context) => V
    export type Context = {
      setSpyOptions: setSpyOptions,
    }
    export type Options = { performer?: SpecRecord.Performer }
  }

  export namespace invoke {
    export type Handler<V> = (context: {
      setSpyOptions: setSpyOptions,
      withThisArg<T>(thisArg: T): T,
      withArgs<A extends any[]>(args: A): A,
    }) => V

    export type Options = {
      site?: SpecRecord.SupportedKeyTypes[],
      performer?: SpecRecord.Performer,
    }
  }

  export type DeclareOptions = {
    performer?: SpecRecord.Performer
  }

  export type StubContext = {
    resolve<V>(refIdOrValue: V, options?: ResolveOptions): V,
    getProperty(site: SpecRecord.SupportedKeyTypes[]): any,
    invoke(args: any[], options?: InvokeOptions): InvocationResponder,
    instantiate(args: any[], options?: InstantiateOptions): InstantiationResponder,
  }

  export type InvokeOptions = {
    performer?: SpecRecord.Performer,
    site?: SpecRecord.SupportedKeyTypes[],
    meta?: Meta,
  }

  export type SpyResultOptions = {
    meta?: Meta,
  }

  export type GetPropertyOptions = {
    // processArgument?: <A>(arg: A) => A,
    /**
     * this is not used at the moment.
     * the use case for this is when the specific plugin do not want the property to be spied,
     * but need to capture additional information so that it can be constructed and simulated correctly.
     */
    meta?: Meta
  }

  export type InvocationRecorder = {
    // args: any[],
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
    performer?: SpecRecord.Performer,
    processArguments?: <A>(id: SpecRecord.ActionId, arg: A) => A,
    meta?: Meta,
  }

  export type InstantiationRecorder = {
    args: any[],
    setInstance(instance: any): SpecRecord.ReferenceId,
    invoke(args: any[], options?: InvokeOptions): InvocationRecorder,
  }

  export type InstantiationResponder = {
    args: any[],
    setInstance(instance: any): SpecRecord.ReferenceId,
    invoke(args: any[], options?: InvokeOptions): InvocationResponder,
  }

  export type ResolveOptions = {
    site?: Array<string | number>
  }
}
