import { reduceByKey } from 'type-plus'
import type { SpecRecord } from '../spec_record/index.js'
import type { MaskCriterion } from './types.internal.js'

export function maskSpecRecord(maskCriteria: MaskCriterion[], record: SpecRecord) {
	if (maskCriteria.length === 0) return record

	return maskCriteria.reduce((record, criterion) => {
		const maskFn = createMaskFn(criterion)
		record.refs.forEach(ref => (ref.meta = maskValue(ref.meta, maskFn)))
		return record
	}, record as SpecRecord)
}

function maskValue<T extends string | number>(value: any, maskFn: (value: T) => T): any {
	if (isMaskSubject(value)) return maskFn(value)
	if (Array.isArray(value)) {
		return value.map(v => maskValue(v, maskFn))
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

function createMaskFn({ value, replaceWith = '[masked]' }: MaskCriterion) {
	if (typeof value === 'string') {
		return createStringMaskFn(value, replaceWith)
	} else {
		return createRegexMaskFn(value, replaceWith)
	}
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
