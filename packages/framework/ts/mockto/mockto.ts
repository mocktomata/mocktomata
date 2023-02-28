import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import type { LoadedContext } from '../context.internal.js'
import { createLogContext } from '../log/log_context.js'
import type { Spec } from '../spec/index.js'
import { createSpecObject, getEffectiveSpecModeContext } from '../spec/index.js'
import { loadPlugins } from '../spec_plugin/index.js'
import { StackFrameContext } from '../stack_frame.types.js'
import { initTimeTrackers } from '../time_trackter/index.js'
import type { Mocktomata } from '../types.js'
import { resolveMocktoFnArgs } from './mockto.utils.js'

/**
 * Create a `Spec` that runs in auto mode.
 */
export type Mockto = Mockto.Fn & {
	/**
	 * Create a `Spec` that runs in live mode.
	 */
	live: Mockto.Fn
	/**
	 * Create a `Spec` that runs in save mode.
	 */
	save: Mockto.Fn
	/**
	 * Create a `Spec` that runs in simulate mode.
	 */
	simulate: Mockto.Fn
	/**
	 * Creates a `Spec` that runs in mock mode.
	 */
	mock: Mockto.MockFn
	/**
	 * Clean up the system in case some `spec.done()` are not called.
	 */
	cleanup(): Promise<void>
}

export namespace Mockto {
	export type Fn = {
		/**
		 * Creates an automatic spec.
		 * Automatic spec will record and save a record in the first run.
		 * In subsequent runs, the saved record will be used to simulate the behavior.
		 * @param specName Name of the spec. Every test in the same file must have a unique spec name.
		 */
		(specName: string, handler: Spec.Handler): void
		(specName: string, options: Spec.Options, handler: Spec.Handler): void
	}
	export type MockFn = {
		/**
		 * Creates an automatic spec.
		 * Automatic spec will record and save a record in the first run.
		 * In subsequent runs, the saved record will be used to simulate the behavior.
		 * @param specName Name of the spec. Every test in the same file must have a unique spec name.
		 */
		(specName: string, handler: Spec.MockHandler): void
		(specName: string, options: Spec.Options, handler: Spec.MockHandler): void
	}
}

export function createMockto({
	context,
	stackFrame
}: { context: AsyncContext<Mocktomata.Context> } & StackFrameContext): Mockto {
	const ctx = context.extend(loadConfig).extend(loadPlugins).extend(initTimeTrackers)

	return Object.assign(createMocktoFn({ context: ctx, stackFrame }), {
		live: createMocktoFn({ context: ctx, stackFrame }, 'live'),
		save: createMocktoFn({ context: ctx, stackFrame }, 'save'),
		mock: createMocktoFn({ context: ctx, stackFrame }, 'mock'),
		simulate: createMocktoFn({ context: ctx, stackFrame }, 'simulate'),
		async cleanup() {
			const { timeTrackers } = await ctx.get()
			timeTrackers.forEach(t => t.terminate())
		}
	})
}

export function createMocktoFn(
	{ context, stackFrame }: { context: AsyncContext<LoadedContext> } & StackFrameContext,
	mode?: Spec.Mode
) {
	const specFn = (...args: any[]) => {
		const { specName, options = { timeout: 3000 }, handler } = resolveMocktoFnArgs(args)
		const reporter = createMemoryLogReporter()

		handler(
			specName,
			createSpecObject(
				context
					.extend({
						options,
						reporter,
						specName,
						specRelativePath: options.specRelativePath ?? stackFrame.getCallerRelativePath()
					})
					.extend(getEffectiveSpecModeContext(mode))
					.extend(createLogContext)
			),
			reporter
		)
	}
	return specFn as Mockto.Fn
}
