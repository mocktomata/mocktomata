import type { SpecRecord } from '../spec-record/types.js'

export function getDefaultPerformer(profile: SpecRecord.SubjectProfile) {
	switch (profile) {
		case 'target':
		case 'output':
			return 'user'
		case 'input':
			return 'mockto'
		default:
			// istanbul ignore next
			throw new Error(`unknown subject profile ${profile}`)
	}
}
