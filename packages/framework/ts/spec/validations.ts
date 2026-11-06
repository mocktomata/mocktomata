import type { SpecRecord } from '../spec_record/types.js'
import { isMatchingKey } from './property_key.js'

export function referenceMismatch(actual: SpecRecord.Reference, expected: SpecRecord.Reference) {
	return !(actual.plugin === expected.plugin && !sourceMismatch(actual.source, expected.source))
}

function sourceMismatch(
	actual: SpecRecord.ReferenceSource | undefined,
	expected: SpecRecord.ReferenceSource | undefined
) {
	if (actual === undefined) {
		return expected !== undefined
	}

	return (
		expected === undefined || actual.id !== expected.id || !isMatchingKey((actual as any).key, (expected as any).key)
	)
}
