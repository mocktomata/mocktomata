import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, MemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import { Config } from '../config/types.js'
import { createLogContext } from '../log/log_context.js'
import { Log } from '../log/types.js'
import { createMocktoFn } from '../mockto/mockto.js'
import { resolveMocktoFnArgs } from '../mockto/mockto.utils.js'
import { createSpecObject, Spec } from '../spec/index.js'
import { loadPlugins, SpecPlugin } from '../spec_plugin/index.js'
import { StackFrameContext } from '../stack_frame.js'
import { newMemoryIO } from '../testing/index.js'
import { initTimeTrackers } from '../time_trackter/index.js'

export namespace createIncubator {
	export type Context = Log.Context & { io: newMemoryIO.TestIO } & Config.Context & StackFrameContext
	export type IncubatorFn = {
		/**
		 * Creates an automatic incubator spec.
		 * Automatic spec will record and save a record in the first run.
		 * In subsequent runs, the saved record will be used to simulate the behavior.
		 * @param specName Name of the spec. Every test in the same file must have a unique spec name.
		 */
		(specName: string, handler: Handler): void
		(specName: string, options: Spec.Options, handler: Handler): void
	}
	export type Handler = (specName: string, spec: Spec, reporter: MemoryLogReporter) => void | Promise<any>
	export type SequenceFn = {
		(specName: string, handler: SequenceHandler): void
		(specName: string, options: Spec.Options, handler: SequenceHandler): void
	}
	export type SequenceHandler = (
		specName: string,
		specs: { save: Spec; simulate: Spec },
		reporter: MemoryLogReporter
	) => void
	export type ConfigOptions = {
		plugins: Array<string | [pluginName: string, activate: (context: SpecPlugin.ActivationContext) => any]>
	}
}

export function createIncubator({
	context,
	stackFrame
}: { context: AsyncContext<createIncubator.Context> } & StackFrameContext) {
	let ctxValue: { plugins: SpecPlugin.Instance[] } | undefined
	let pluginInstances: SpecPlugin.Instance[] | undefined

	const ctx = context
		.extend(loadConfig)
		.extend(loadPlugins)
		.extend(async value => {
			ctxValue = value
			return { plugins: (value.plugins = pluginInstances ?? value.plugins) }
		})
		.extend(initTimeTrackers)

	async function config(options: createIncubator.ConfigOptions) {
		const { plugins } = await ctx
			.extend(async ({ config, io }) => {
				const plugins = options.plugins.map(p => {
					// istanbul ignore next
					if (typeof p === 'string') return p
					const [name, activate] = p
					io.addPlugin(name, { activate })
					return name
				})
				return { config: { ...config, plugins } }
			})
			.extend(loadPlugins)
			.get()
		if (!ctxValue) pluginInstances = plugins
		else ctxValue.plugins.splice(0, ctxValue.plugins.length, ...plugins)
	}
	const save = createMocktoFn({ context: ctx, stackFrame }, 'save')
	const simulate = createMocktoFn({ context: ctx, stackFrame }, 'simulate')
	const sequence: createIncubator.SequenceFn = (...args: any[]) => {
		const {
			specName,
			options = { timeout: 3000 },
			handler
		} = resolveMocktoFnArgs<createIncubator.SequenceHandler>(args)
		const reporter = createMemoryLogReporter()
		handler(
			specName,
			{
				save: createSpecObject(
					ctx
						.extend({
							mode: 'save',
							specName,
							options,
							reporter,
							specRelativePath: stackFrame.getCallerRelativePath(sequence)
						})
						.extend(createLogContext)
				),
				simulate: createSpecObject(
					ctx
						.extend({
							mode: 'simulate',
							specName,
							options,
							reporter,
							specRelativePath: stackFrame.getCallerRelativePath(sequence)
						})
						.extend(createLogContext)
				)
			},
			reporter
		)
	}
	const duo: createIncubator.IncubatorFn = (...args: any[]) => {
		const { specName, options, handler } = resolveMocktoFnArgs(args)
		if (options) {
			save(specName, options, handler)
			simulate(specName, options, handler)
		} else {
			save(specName, handler)
			simulate(specName, handler)
		}
	}

	return Object.assign(duo, {
		save,
		simulate,
		sequence,
		config,
		/**
		 * Clean up the test environment when `spec.done()` is missing or when there are test failures.
		 */
		async cleanup() {
			const { timeTrackers } = await ctx.get()
			timeTrackers.forEach(t => t.terminate())
		}
	})
}
