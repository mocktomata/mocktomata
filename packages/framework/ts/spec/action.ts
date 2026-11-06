import type { SpecRecord } from '../spec_record/types.js'
import { maskString } from './masking.js'
import { isMatchingKey } from './property_key.js'
import type { SpecRecordValidator } from './record.js'
import type { MaskCriterion } from './types.internal.js'
import type { Spec } from './types.js'

/**
 * The built-in string plugin, registered by `es2015` and `es2020`.
 * Other plugins may record a string in a different form, so only its references are compared.
 */
const stringPluginName = '@mocktomata/string'

/**
 * What the simulation needs to compare an argument or an assigned value with the record.
 */
export type MatchingContext = {
	argumentMatching: Spec.ArgumentMatching
	maskCriteria: MaskCriterion[]
}

/**
 * Describes the first argument that does not match the record.
 */
export type ArgumentMismatchDetail = {
	argumentMatching: Spec.ArgumentMatching
	index: number
	/**
	 * Set when the argument is a string that differs from the recorded string.
	 * Both values are masked with the `maskValue()` criteria of the current run.
	 */
	strings?: { expected: string; received: string }
}

export function isMatchingGetAction(
	actual: SpecRecord.GetAction,
	expected: SpecRecord.Action | undefined
): actual is SpecRecord.GetAction {
	return (
		!!expected &&
		expected.type === 'get' &&
		actual.refId === expected.refId &&
		actual.performer === expected.performer &&
		isMatchingKey(actual.key, expected.key)
	)
}

export function isMatchingSetAction(
	record: SpecRecordValidator,
	matching: MatchingContext,
	actual: SpecRecord.SetAction,
	expected: SpecRecord.Action
): actual is SpecRecord.SetAction {
	// wrong type
	if (expected.type !== 'set') return false

	if (
		actual.refId !== expected.refId ||
		actual.performer !== expected.performer ||
		!isMatchingKey(actual.key, expected.key)
	)
		return false

	// compare primitive values
	if (typeof expected.value !== 'string') return actual.value === expected.value

	// don't care about actual value if expectation is inert
	const expectedRef = record.getLoadedRef(expected.value)!
	if (expectedRef.inert) return true

	// actual is primitive value but expected is not primitive or not inert
	if (typeof actual.value !== 'string') return false

	// `actual.value` is a raw string when no reference is left to hold it,
	// so it is not the recorded reference.
	const actualRef = record.getRef(actual.value)
	if (!actualRef) return false

	// ignore function, class, object, and array
	if (!isPrimitive(actualRef.subject)) return true

	// The reference holds the value of this run in `subject` when it has one,
	// while the recorded value is in the loaded `meta`.
	if (typeof actualRef.subject === 'string' && typeof expectedRef.meta === 'string')
		return isMatchingString(matching.maskCriteria, actualRef.subject, expectedRef.meta)

	// only string|undefined goes here, which comparing meta would work
	return actualRef.meta === expectedRef.meta
}
function isPrimitive(value: any) {
	return typeof value !== 'object' && typeof value !== 'function'
}

export function isMatchingInvokeAction(
	record: SpecRecordValidator,
	matching: MatchingContext,
	actual: SpecRecord.InvokeAction,
	expected: SpecRecord.Action
): actual is SpecRecord.InvokeAction {
	return (
		isSameInvokeTarget(actual, expected) && !findPayloadMismatch(record, matching, actual.payload, expected.payload)
	)
}

export function isMatchingInstantiateAction(
	record: SpecRecordValidator,
	matching: MatchingContext,
	actual: SpecRecord.InstantiateAction,
	expected: SpecRecord.Action
): actual is SpecRecord.InstantiateAction {
	return (
		isSameInstantiateTarget(actual, expected) &&
		!findPayloadMismatch(record, matching, actual.payload, expected.payload)
	)
}

/**
 * Finds the first argument that does not match the record,
 * when the action is otherwise the expected one.
 */
export function findArgumentMismatch(
	record: SpecRecordValidator,
	matching: MatchingContext,
	actual: SpecRecord.InvokeAction | SpecRecord.InstantiateAction,
	expected: SpecRecord.Action | undefined
): ArgumentMismatchDetail | undefined {
	if (!expected) return undefined
	const sameTarget =
		actual.type === 'invoke' ? isSameInvokeTarget(actual, expected) : isSameInstantiateTarget(actual, expected)
	if (!sameTarget) return undefined
	const mismatch = findPayloadMismatch(record, matching, actual.payload, (expected as typeof actual).payload)
	return mismatch ? { argumentMatching: matching.argumentMatching, ...mismatch } : undefined
}

function isSameInvokeTarget(
	actual: SpecRecord.InvokeAction,
	expected: SpecRecord.Action
): expected is SpecRecord.InvokeAction {
	return (
		expected.type === 'invoke' &&
		actual.refId === expected.refId &&
		actual.performer === expected.performer &&
		actual.thisArg === expected.thisArg
	)
}

function isSameInstantiateTarget(
	actual: SpecRecord.InstantiateAction,
	expected: SpecRecord.Action
): expected is SpecRecord.InstantiateAction {
	return expected.type === 'instantiate' && actual.refId === expected.refId && actual.performer === expected.performer
}

function findPayloadMismatch(
	record: SpecRecordValidator,
	matching: MatchingContext,
	actualPayload: any[],
	expectedPayload: any[]
): Omit<ArgumentMismatchDetail, 'argumentMatching'> | undefined {
	const length = Math.min(actualPayload.length, expectedPayload.length)
	for (let index = 0; index < length; index++) {
		const actual = actualPayload[index]
		const expected = expectedPayload[index]
		// Reference ids and primitive values (number, boolean, bigint).
		if (actual !== expected) return { index }
		if (matching.argumentMatching === 'strings') {
			const strings = findStringMismatch(record, matching.maskCriteria, actual)
			if (strings) return { index, strings }
		}
	}
	if (actualPayload.length !== expectedPayload.length) return { index: length }
	return undefined
}

/**
 * In simulation, a new string takes over the next unused recorded string reference,
 * so the reference ids always match.
 * This compares the string of this run (`subject`) with the recorded one (loaded `meta`).
 */
function findStringMismatch(
	record: SpecRecordValidator,
	maskCriteria: MaskCriterion[],
	refId: unknown
): { expected: string; received: string } | undefined {
	if (typeof refId !== 'string') return undefined
	const expectedRef = record.getLoadedRef(refId)
	if (!expectedRef || expectedRef.inert || expectedRef.plugin !== stringPluginName) return undefined
	if (typeof expectedRef.meta !== 'string') return undefined
	const actualRef = record.getRef(refId)
	if (!actualRef || typeof actualRef.subject !== 'string') return undefined

	const received = maskString(maskCriteria, actualRef.subject)
	const expected = maskString(maskCriteria, expectedRef.meta)
	return received === expected ? undefined : { expected, received }
}

function isMatchingString(maskCriteria: MaskCriterion[], actual: string, expected: string) {
	return maskString(maskCriteria, actual) === maskString(maskCriteria, expected)
}
