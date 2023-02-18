import type { AsyncContext } from 'async-fp'
import type { LogLevel } from 'standard-log'
import { createAutoSpec } from './auto_spec.js'
import { InvokeMetaMethodAfterSpec } from './errors.js'
import { createLiveSpec } from './live_spec.js'
import { createMockSpec } from './mock_spec.js'
import { createSaveSpec } from './save_spec.js'
import { createSimulateSpec } from './simulate_spec.js'
import type { MaskCriterion } from './types.internal.js'
import type { Spec } from './types.js'

export function createSpecObject(context: AsyncContext<Spec.Context>) {
	const { spec, modeProperty: mode, ignoreMismatch, maskValue, done } = createSpecFns(context)
	return Object.assign(Object.defineProperties(spec, { mode }), { ignoreMismatch, maskValue, done }) as any
}

export function createSpecFns(context: AsyncContext<Spec.Context>) {
	let s: Spec | undefined
	type InitState = {
		enableLog: boolean
		ignoreValues: any[]
		maskCriteria: MaskCriterion[]
		logLevel?: LogLevel
	}
	const initState: InitState = { enableLog: false, ignoreValues: [], maskCriteria: [] }
	async function createActualSpec(initState: InitState) {
		if (s) return s
		const { mode, specName, options, specRelativePath } = await context.get()
		const spec = (s = await createSpec(context, specName, specRelativePath, mode, options))
		initState.ignoreValues.forEach(v => spec.ignoreMismatch(v))
		initState.maskCriteria.forEach(v => spec.maskValue(v.value, v.replaceWith))
		return spec
	}

	function ignoreMismatch(value: any) {
		if (s) throw new InvokeMetaMethodAfterSpec('ignoreMismatch')
		else initState.ignoreValues.push(value)
	}
	function maskValue(value: string | RegExp, replaceWith?: string) {
		if (s) throw new InvokeMetaMethodAfterSpec('maskValue')
		initState.maskCriteria.push({ value, replaceWith })
	}

	let actualMode: Spec.Mode
	const modeProperty = {
		get() {
			return actualMode
		}
	}
	let actualSpec: Spec
	function done() {
		if (actualSpec) return actualSpec.done()
		// spec can be not used at all,
		// e.g. in `scenario`.
		return createActualSpec(initState).then(a => a.done())
	}
	const spec = (subject: any, options?: any) =>
		createActualSpec(initState).then(aspec => {
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
			return createMockSpec()
		// istanbul ignore next
		default:
			throw new Error(`Unknown mode: ${mode}`)
	}
}
