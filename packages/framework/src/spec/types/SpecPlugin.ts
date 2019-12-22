import { Meta } from './Meta';
import { SpecRecord } from './SpecRecord';

export type SpecPlugin<S = any, M = string> = {
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
    /**
     * Set the `meta` data of the spy.
     * The `meta` data will be available when the stub is created during simulation.
     * If you want to record `meta` data for the action being performed,
     * use the `setMeta()` provided by each action instead of this function.
     * @returns the input meta.
     */
    setMeta: SpyContext.setMeta,
    setSpyOptions: SpyContext.setSpyOptions,
    getSpyId: SpyContext.getSpyId,
    getProperty: SpyContext.getProperty,
    setProperty: SpyContext.setProperty,
    invoke: SpyContext.invoke,
    instantiate: SpyContext.instantiate,
  }
  export namespace SpyContext {
    export type setMeta = <M extends Meta>(meta: M) => M
    export type setSpyOptions = <S>(subject: S, options: setSpyOptions.Options) => void
    export namespace setSpyOptions {
      export type Options = {
        plugin?: string,
        profile?: SpecRecord.SubjectProfile,
      }
    }

    /**
     * gets the reference id of the value if it is supported by a plugin,
     * else the value itself will be returned.
     */
    export type getSpyId = <V = any>(value: V) => SpecRecord.ReferenceId | V

    export type getProperty = <V = any>(options: getProperty.Options, handler: getProperty.Handler<V>) => V
    export namespace getProperty {
      export type Options = {
        key: SpecRecord.SupportedKeyTypes,
        performer?: SpecRecord.Performer,
      }
      export type Handler<V> = () => V
    }

    export type setProperty = <V = any, R = any>(options: setProperty.Options<V>, handler: setProperty.Handler<V, R>) => R
    export namespace setProperty {
      export type Options<V> = {
        key: SpecRecord.SupportedKeyTypes,
        value: V,
        performer?: SpecRecord.Performer,
      }
      export type Handler<V, R> = (value: V) => R
    }


    export type invoke = <V = any, T = any, A extends any[] = any[]>(options: invoke.Options<T, A>, handler: invoke.Handler<V, T, A>) => V
    export namespace invoke {
      export type Options<T, A extends any[]> = {
        thisArg: T,
        args: A,
        performer?: SpecRecord.Performer,
        site?: SpecRecord.SupportedKeyTypes,
      }
      export type Handler<V, T, A> = (context: Context<T, A>) => V
      export type Context<T, A> = {
        thisArg: T,
        args: A,
        // setMeta: setMeta,
      }
    }
    export type instantiate = <V = any>(options: instantiate.Options | undefined, hander: instantiate.Handler<V>) => any
    export namespace instantiate {
      export type Options = {
        args: any[],
        performer?: SpecRecord.Performer,
      }
      export type Handler<V> = (context: Context) => V
      export type Context = {
        setMeta: setMeta,
        withArgs<A extends any[]>(args: A): A,
      }
    }
  }

  export type StubContext = {
    resolve: StubContext.resolve,
    getProperty: StubContext.getProperty,
    setProperty: StubContext.setProperty,
    invoke: StubContext.invoke,
    instantiate: StubContext.instantiate,
    on: StubContext.on,
  }

  export namespace StubContext {
    export type resolve = (value: any) => any

    export type getProperty = (options: getProperty.Options) => any
    export namespace getProperty {
      export type Options = {
        key: SpecRecord.SupportedKeyTypes,
        performer?: SpecRecord.Performer,
      }
    }

    export type setProperty = <V = any>(options: setProperty.Options<V>) => V
    export namespace setProperty {
      export type Options<V> = {
        key: SpecRecord.SupportedKeyTypes,
        value: V,
        performer?: SpecRecord.Performer,
      }
    }

    export type invoke = (options: invoke.Options, handler?: invoke.Handler) => any
    export namespace invoke {
      export type Options = {
        thisArg: any,
        args: any[],
        performer?: SpecRecord.Performer,
        site?: SpecRecord.SupportedKeyTypes,
      }
      export type Handler = (context: Context) => any
      export type Context = {
        thisArg: any,
        args: any[],
      }
    }

    export type instantiate = (options: instantiate.Options) => any
    export namespace instantiate {
      export type Options = {
        args: any[],
        performer?: SpecRecord.Performer,
      }
    }

    export type on = (pluginAction: PluginAction) => any

    export type PluginAction = PluginInvokeAction

    export type PluginInvokeAction = {
      type: 'invoke',
      site?: SpecRecord.SupportedKeyTypes,
      thisArg: any,
      args: any[]
    }
  }

  export type InvokeOptions = {
    performer?: SpecRecord.Performer,
    site?: SpecRecord.SupportedKeyTypes,
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
      site?: SpecRecord.Site
    }
  }

  export type DeclareOptions = {
    performer?: SpecRecord.Performer
  }
}
