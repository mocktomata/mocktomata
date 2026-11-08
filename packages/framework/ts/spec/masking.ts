import { reduceByKey } from 'type-plus'
import type { SpecRecord } from '../spec_record/index.js'
import type { MaskCriterion } from './types.internal.js'
import type { Spec } from './types.js'

const defaultPlaceholder = '[masked]'

/**
 * `maskValue()` takes the replacement string, or the options.
 */
export function toMaskCriterion(
	value: string | RegExp,
	replaceWithOrOptions?: string | Spec.MaskValueOptions
): MaskCriterion {
	if (typeof replaceWithOrOptions === 'object' && replaceWithOrOptions !== null) {
		const { replaceWith, restore } = replaceWithOrOptions
		return { value, replaceWith, restore }
	}
	return { value, replaceWith: replaceWithOrOptions }
}

export type MaskRestore = {
	placeholder: string
	value: string
}

/**
 * Finds the criteria that can put the value of this run back in place of their placeholder.
 *
 * A criterion can be restored only when it is a string,
 * and no other criterion uses the same placeholder.
 * The others are returned in `rejected`, so that a warning can be logged.
 */
export function getMaskRestores(maskCriteria: MaskCriterion[]) {
	const restores: MaskRestore[] = []
	const rejected: Array<{ criterion: MaskCriterion; placeholder: string; reason: 'regex' | 'shared' }> = []
	for (const criterion of maskCriteria) {
		if (!criterion.restore) continue
		const placeholder = criterion.replaceWith ?? defaultPlaceholder
		if (typeof criterion.value !== 'string') {
			rejected.push({ criterion, placeholder, reason: 'regex' })
			continue
		}
		const shared = maskCriteria.some((c) => c !== criterion && (c.replaceWith ?? defaultPlaceholder) === placeholder)
		if (shared) {
			rejected.push({ criterion, placeholder, reason: 'shared' })
			continue
		}
		restores.push({ placeholder, value: criterion.value })
	}
	return { restores, rejected }
}

/**
 * Puts the value of this run back in place of each placeholder in the string.
 * A placeholder is matched inside a longer string, such as `Bearer [masked]`.
 */
export function restoreString(restores: MaskRestore[], value: string) {
	return restores.reduce((v, { placeholder, value }) => v.split(placeholder).join(value), value)
}

export function maskSpecRecord(maskCriteria: MaskCriterion[], record: SpecRecord) {
	if (maskCriteria.length === 0) return record

	return maskCriteria.reduce((record, criterion) => {
		const maskFn = createMaskFn(criterion)
		record.refs.forEach((ref) => {
			ref.meta = maskValue(ref.meta, maskFn)
		})
		return record
	}, record as SpecRecord)
}

function maskValue<T extends string | number>(value: any, maskFn: (value: T) => T): any {
	if (isMaskSubject(value)) return maskFn(value as T)
	if (Array.isArray(value)) {
		return value.map((v) => maskValue(v, maskFn))
	}
	if (typeof value === 'object' && value !== null) {
		// istanbul ignore next - this is not hit right now because no plugin saving meta as an object.
		// this could change with plugins
		return reduceByKey(
			value,
			(v, key) => {
				v[key] = maskValue(v[key], maskFn)
				return v
			},
			value
		)
	}
	return value
}

function isMaskSubject(value: any) {
	return typeof value === 'string'
}

export function maskString(maskCriteria: MaskCriterion[], value: string) {
	if (maskCriteria.length === 0) return value
	// if (typeof value === 'string') return value
	return maskCriteria.reduce((value, criterion) => {
		const maskFn = createMaskFn(criterion)
		return maskValue(value, maskFn)
	}, value)
}

function createMaskFn({ value, replaceWith = defaultPlaceholder }: MaskCriterion) {
	if (typeof value === 'string') {
		return createStringMaskFn(value, replaceWith)
	}
	return createRegexMaskFn(value, replaceWith)
}

function createStringMaskFn(value: string, replaceWith: string) {
	function replacer(v: string) {
		while (v.indexOf(value) >= 0) {
			v = v.replace(value, replaceWith)
		}
		return v
	}
	return replacer
}

function createRegexMaskFn(regex: RegExp, replaceWith: string) {
	function replacer(v: string) {
		return v.replace(regex, replaceWith)
	}
	return replacer
}
