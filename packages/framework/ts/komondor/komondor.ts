import type { AsyncContext } from 'async-fp'
import { createMemoryLogReporter, MemoryLogReporter } from 'standard-log'
import { loadConfig } from '../config/index.js'
import type { LoadedContext } from '../context.internal.js'
import { createLogContext } from '../log/log_context.js'
import { createSpecObject, getEffectiveSpecModeContext, type Spec } from '../spec/index.js'
import type { MockSpec } from '../spec/types.js'
import { loadPlugins } from '../spec_plugin/index.js'
import { StackFrameContext } from '../stack_frame.types.js'
import { initTimeTrackers } from '../time_trackter/index.js'
import type { Mocktomata } from '../types.js'

/**
 * Creates a `Spec` that runs in auto mode to simulate the behavior of your code.
 */
export type Komondor = Komondor.Fn & {
	/**
	 * Creates a `Spec` that runs in live mode.
	 */
	live: Komondor.Fn
	/**
	 * Creates a `Spec` that runs in save mode.
	 */
	save: Komondor.Fn
	/**
	 * Creates a `Spec` that runs in simulate mode.
	 */
	simulate: Komondor.Fn
	/**
	 * Creates a `Spec` that runs in mock mode.
	 */
	mock: Komondor.MockFn
	/**
	 * Clean up the system in case some `spec.done()` are not called.
	 */
	cleanup(): Promise<void>
}

export namespace Komondor {
	export type Fn = (
		specName: string,
		options?: Spec.Options
	) => Spec & {
		/**
		 * An in-memory reporter containing the logs for inspection.
		 */
		reporter: MemoryLogReporter
	}
	export type MockFn = (
		specName: string,
		options?: Spec.Options
	) => MockSpec & {
		/**
		 * An in-memory reporter containing the logs for inspection.
		 */
		reporter: MemoryLogReporter
	}
}

export function createKomondor({
	context,
	stackFrame
}: { context: AsyncContext<Mocktomata.Context> } & StackFrameContext): Komondor {
	const ctx = context.extend(loadConfig).extend(loadPlugins).extend(initTimeTrackers)

	return Object.assign(createKomondorFn({ context: ctx, stackFrame }), {
		live: createKomondorFn({ context: ctx, stackFrame }, 'live'),
		save: createKomondorFn({ context: ctx, stackFrame }, 'save'),
		mock: createKomondorFn({ context: ctx, stackFrame }, 'mock'),
		simulate: createKomondorFn({ context: ctx, stackFrame }, 'simulate'),
		async cleanup() {
			const { timeTrackers } = await ctx.get()
			timeTrackers.forEach(t => t.terminate())
		}
	})
}

function createKomondorFn(
	{ context, stackFrame }: { context: AsyncContext<LoadedContext> } & StackFrameContext,
	mode?: Spec.Mode
) {
	const komondorFn = function komondorFn(specName: string, options: Spec.Options = { timeout: 3000 }) {
		const reporter = createMemoryLogReporter()

		return Object.assign(
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
			{ reporter }
		)
	}
	return komondorFn
}
