import type { AsyncContext } from 'async-fp'
import type { LogLevel } from 'standard-log'
import { createAutoSpec } from './auto_spec.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'
import { createLiveSpec } from './live_spec.js'
import { toMaskCriterion } from './masking.js'
import { createMockSpec } from './mock_spec.js'
import { createSaveSpec } from './save_spec.js'
import { createSimulateSpec } from './simulate_spec.js'
import type { IgnoreMismatchEntry, MaskCriterion } from './types.internal.js'
import type { Spec } from './types.js'

export function createSpecObject(context: AsyncContext<Spec.Context>) {
	const { spec, modeProperty: mode, ignoreMismatch, maskValue, done } = createSpecFns(context)
	return Object.assign(Object.defineProperties(spec, { mode }), {
		ignoreMismatch,
		maskValue,
		done
	}) as any
}

export function createSpecFns(context: AsyncContext<Spec.Context>) {
	let s: Spec | undefined
	type InitState = {
		enableLog: boolean
		ignoreValues: IgnoreMismatchEntry[]
		maskCriteria: MaskCriterion[]
		logLevel?: LogLevel
	}
	const initState: InitState = {
		enableLog: false,
		ignoreValues: [],
		maskCriteria: []
	}
	async function createActualSpec(initState: InitState) {
		if (s) return s
		const { mode, specName, options, specRelativePath } = await context.get()
		const spec = (s = await createSpec(context, specName, specRelativePath, mode, options))
		initState.ignoreValues.forEach(({ value, options }) => {
			spec.ignoreMismatch(value, options)
		})
		initState.maskCriteria.forEach(({ value, replaceWith, restore }) => {
			spec.maskValue(value, { replaceWith, restore })
		})
		return spec
	}

	function ignoreMismatch(value: unknown, options?: Spec.IgnoreMismatchOptions) {
		if (s) throw new InvokeMetaMethodAfterSpec('ignoreMismatch')
		initState.ignoreValues.push({ value, options })
	}
	let maskLog: Promise<void> | undefined
	function maskValue(value: string | RegExp, replaceWithOrOptions?: string | Spec.MaskValueOptions) {
		if (s) {
			maskLog = context.get().then(({ log }) => log.warn('maskValue is called after spec is invoked'))
		}
		initState.maskCriteria.push(toMaskCriterion(value, replaceWithOrOptions))
	}

	let actualMode: Spec.Mode
	const modeProperty = {
		get() {
			return actualMode
		}
	}
	let actualSpec: Spec
	async function done() {
		if (maskLog) await maskLog
		if (actualSpec) return actualSpec.done()
		// spec can be not used at all,
		// e.g. in `scenario`.
		return createActualSpec(initState).then((a) => a.done())
	}
	const spec = (subject: any, options?: any) =>
		createActualSpec(initState).then((aspec) => {
			actualSpec = aspec
			actualMode = aspec.mode
			return aspec(subject, options)
		})
	return { spec, modeProperty, ignoreMismatch, maskValue, done }
}

async function createSpec(
	context: AsyncContext<Spec.Context>,
	specName: string,
	invokeRelativePath: string,
	mode: Spec.Mode,
	options: Spec.Options
): Promise<Spec> {
	const ctx = context.extend({ maskCriteria: [] as MaskCriterion[] })
	switch (mode) {
		case 'auto':
			return createAutoSpec(ctx, specName, invokeRelativePath, options)
		case 'live':
			return createLiveSpec()
		case 'save':
			return createSaveSpec(ctx, specName, invokeRelativePath, options)
		case 'simulate':
			return createSimulateSpec(ctx, specName, invokeRelativePath, options)
		case 'mock':
			return createMockSpec(ctx, specName, invokeRelativePath, options)
		// istanbul ignore next
		default:
			throw new Error(`Unknown mode: ${mode}`)
	}
}
