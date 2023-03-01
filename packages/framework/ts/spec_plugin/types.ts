import { Logger } from 'standard-log'
import type { RequiredPick } from 'type-plus'
import type { SpecRecord } from '../spec_record/types.js'

export type SpecPlugin<S = any, M = any> = {
	/**
	 * Name of the plugin. This is needed only if there are multiple plugins in a package.
	 */
	name?: string
	/**
	 * Indicates if the plugin can handle the specified subject.
	 */
	support(subject: unknown): boolean
	/**
	 * Creates a spy that captures the interactions with the specified subject.
	 * @param context Provides tools needed to record the subject's behavior.
	 * @param subject The subject to spy.
	 */
	createSpy(context: SpecPlugin.SpyContext<M>, subject: S): S
	/**
	 * Creates a stub in place of the specified subject.
	 * @param context Provides tools needed to reproduce the subject's behavior.
	 * @param meta Meta data of the subject.
	 * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
	 */
	createStub(context: SpecPlugin.StubContext, subject: S, meta: M): S
}

export namespace SpecPlugin {
	export type Config = {
		ecmaVersion: 'es2015' | 'es2020'
		plugins: string[]
	}

	export type Context = {
		io: IO
		config: Config
	}

	export type IO = {
		loadPlugin(name: string): Promise<Module>
	}

	export type Module = {
		activate: (activationContext: ActivationContext) => void
	}

	export type ActivationContext = {
		register(plugin: SpecPlugin): void
	}

	export type Instance<S = any> = RequiredPick<SpecPlugin<S, any>, 'name'>

	export type SpyContext<M> = {
		/**
		 * Set the `meta` data of the spy.
		 * The `meta` data will be available when the stub is created during simulation.
		 * If you want to record `meta` data for the action being performed,
		 * use the `setMeta()` provided by each action instead of this function.
		 * @returns the input meta.
		 */
		setMeta: SpyContext.setMeta<M>
		/**
		 * Tell mockto to treat the specified value in certain way,
		 * instead of the default behavior.
		 */
		setSpyOptions: SpyContext.setSpyOptions
		/**
		 * Gets the spy of the specified value.
		 * If the value do not need to be spied on, itself is returned.
		 * This is used to get the spy of the value contained or returned by the subject of the plugin.
		 * For example, entries inside an array.
		 */
		getSpy: <S>(value: S) => S
		/**
		 * Gets the id of a value.
		 * If the value is a spy, its id is returned.
		 * If not the value itself is returned.
		 * This used mostly during `setMeta()` to get the right meta representation.
		 * During stub, use `resolve` to get the value back.
		 */
		getSpyId: SpyContext.getSpyId
		getProperty: SpyContext.getProperty
		setProperty: SpyContext.setProperty
		invoke: SpyContext.invoke
		instantiate: SpyContext.instantiate
		log: Logger
	}
	export namespace SpyContext {
		export type setMeta<M> = (meta: M) => M
		export type setSpyOptions = <S>(subject: S, options: setSpyOptions.Options) => void
		export namespace setSpyOptions {
			export type Options = {
				plugin?: string
				profile?: SpecRecord.SubjectProfile
				/**
				 * Indicates changes of this value will not cause ActionMismatch error.
				 */
				inert?: boolean
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
				key: SpecRecord.SupportedKeyTypes
				performer?: SpecRecord.Performer
			}
			export type Handler<V> = () => V
		}

		export type setProperty = <V = any, R = any>(
			options: setProperty.Options<V>,
			handler: setProperty.Handler<V, R>
		) => true
		export namespace setProperty {
			export type Options<V> = {
				key: SpecRecord.SupportedKeyTypes
				value: V
				performer?: SpecRecord.Performer
			}
			export type Handler<V, R> = (value: V) => R
		}

		export type invoke = <V = any, T = any, A extends any[] = any[]>(
			options: invoke.Options<T, A>,
			handler: invoke.Handler<V, T, A>
		) => V
		export namespace invoke {
			export type Options<T, A extends any[]> = {
				thisArg: T
				args: A
				performer?: SpecRecord.Performer
				site?: SpecRecord.SupportedKeyTypes
			}
			export type Handler<V, T, A> = (context: Context<T, A>) => V
			export type Context<T, A> = {
				thisArg: T
				args: A
			}
		}

		export type instantiate = <V = any, A extends any[] = any[]>(
			options: instantiate.Options<A>,
			hander: instantiate.Handler<V, A>
		) => V

		export namespace instantiate {
			export type Options<A> = {
				args: A
				performer?: SpecRecord.Performer
			}
			export type Handler<V, A> = (context: Context<A>) => V
			export type Context<A> = { args: A }
		}
	}

	export type StubContext = {
		resolve: StubContext.resolve
		getProperty: StubContext.getProperty
		setProperty: StubContext.setProperty
		invoke: StubContext.invoke
		instantiate: StubContext.instantiate
		on: StubContext.on
		log: Logger
	}

	export namespace StubContext {
		export type resolve = (value: any, handler?: () => any) => any

		export type getProperty = (options: getProperty.Options) => any
		export namespace getProperty {
			export type Options = {
				key: SpecRecord.SupportedKeyTypes
				performer?: SpecRecord.Performer
			}
		}

		export type setProperty = <V = any>(options: setProperty.Options<V>) => true
		export namespace setProperty {
			export type Options<V> = {
				key: SpecRecord.SupportedKeyTypes
				value: V
				performer?: SpecRecord.Performer
			}
		}

		export type invoke = (options: invoke.Options) => any
		export namespace invoke {
			export type Options = {
				thisArg: any
				args: any[]
				performer?: SpecRecord.Performer
				site?: SpecRecord.SupportedKeyTypes
			}
		}

		export type instantiate = (options: instantiate.Options, handler: instantiate.Handler) => any
		export namespace instantiate {
			export type Context = { args: any[] }
			export type Handler = (context: Context) => any
			export type Options = {
				args: any[]
				performer?: SpecRecord.Performer
			}
		}

		export type on = (pluginAction: PluginAction) => any

		export type PluginAction = PluginInvokeAction

		export type PluginInvokeAction = {
			type: 'invoke'
			site?: SpecRecord.SupportedKeyTypes
			thisArg: any
			args: any[]
		}
	}

	export type InvokeOptions = {
		performer?: SpecRecord.Performer
		site?: SpecRecord.SupportedKeyTypes
		meta?: SpecRecord.Meta
	}

	export type SpyResultOptions = {
		meta?: SpecRecord.Meta
	}

	export type GetPropertyOptions = {
		// processArgument?: <A>(arg: A) => A,
		/**
		 * this is not used at the moment.
		 * the use case for this is when the specific plugin do not want the property to be spied,
		 * but need to capture additional information so that it can be constructed and simulated correctly.
		 */
		meta?: SpecRecord.Meta
	}

	export type InstantiateOptions = {
		performer?: SpecRecord.Performer
		processArguments?: <A>(id: SpecRecord.ActionId, arg: A) => A
		meta?: SpecRecord.Meta
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
			profile?: SpecRecord.SubjectProfile
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
