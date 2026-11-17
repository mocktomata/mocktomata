import type { Logger } from '../standard_log.types.js'
import { getMaskRestores, type MaskRestore, restoreString } from './masking.js'
import type { MaskCriterion } from './types.internal.js'

/**
 * `ignoreMismatch()` accepts these types.
 */
export function isIgnorableValue(value: unknown) {
	const type = typeof value
	return type === 'bigint' || type === 'boolean' || type === 'number' || type === 'string'
}

export type Replay = ReturnType<typeof createReplay>

/**
 * Changes the values that simulation hands back to the code,
 * as asked by `ignoreMismatch(value, { replay: 'substitute' })` and `maskValue(value, { restore: true })`.
 *
 * It never changes the record.
 */
export function createReplay() {
	const ignored: Array<{ value: unknown; substitute: boolean }> = []
	const pairings: Array<{ recorded: unknown; value: unknown; substitute: boolean; conflict?: boolean }> = []
	let restores: MaskRestore[] = []
	const warned = new Set<MaskCriterion>()

	return {
		/**
		 * Registers a value of this run passed to `ignoreMismatch()`.
		 */
		addIgnored(value: unknown, substitute: boolean) {
			ignored.push({ value, substitute })
		},
		/**
		 * Pairs the recorded value with the value of this run that takes its place.
		 * Only a value passed to `ignoreMismatch()` in this run, of the same type as the recorded value, is paired.
		 * Once paired, the value of this run stands for the recorded value when it comes back.
		 * It is also substituted in replayed values when it was passed with `{ replay: 'substitute' }`.
		 *
		 * A recorded value can be paired with one value only.
		 * When a second, different value takes its place, it is ambiguous:
		 * the recorded value is no longer substituted, and a warning is logged.
		 *
		 * @returns `true` when the value is paired.
		 */
		pair(log: Logger, recorded: unknown, value: unknown) {
			if (recorded === value) return false
			if (typeof recorded !== typeof value) return false
			const entries = ignored.filter((e) => e.value === value)
			if (entries.length === 0) return false
			const substitute = entries.some((e) => e.substitute)
			const existing = pairings.find((p) => p.recorded === recorded)
			if (existing) {
				if (existing.value === value || existing.conflict) return false
				existing.conflict = true
				if (existing.substitute || substitute) {
					// The values are not shown: they can be sensitive.
					log.warn(
						'ignoreMismatch(): a recorded value is taken by two different values in this run, so it is no longer substituted. Give the values distinct recorded values to substitute them.'
					)
				}
				return false
			}
			pairings.push({ recorded, value, substitute })
			return true
		},
		/**
		 * Reads the `maskValue()` criteria of this run.
		 * Logs a warning, once per criterion, for each criterion that asks for restore but cannot have it.
		 * The warning shows the placeholder only, never the value.
		 */
		updateRestores(log: Logger, maskCriteria: MaskCriterion[]) {
			const result = getMaskRestores(maskCriteria)
			restores = result.restores
			for (const { criterion, placeholder, reason } of result.rejected) {
				if (warned.has(criterion)) continue
				warned.add(criterion)
				log.warn(
					reason === 'regex'
						? `maskValue(): a regex criterion cannot be restored, so "${placeholder}" stays masked. Pass the value as a string to restore it.`
						: `maskValue(): the placeholder "${placeholder}" is used by more than one criterion, so it stays masked. Give the criterion a distinct replaceWith to restore it.`
				)
			}
		},
		/**
		 * Returns the value to hand back to the code in place of a replayed value.
		 */
		apply<T>(value: T): T {
			const pairing = pairings.find((p) => p.recorded === value)
			if (pairing?.substitute && !pairing.conflict) return pairing.value as T
			if (typeof value === 'string' && restores.length > 0) return restoreString(restores, value) as T
			return value
		}
	}
}
