import type { Logger } from 'standard-log'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { SpecRecord } from '../spec-record/types.js'
import type { TimeTracker } from '../time_trackter/index.js'
import type { SpecRecorderBuilder } from './record.js'
import type { Spec } from './types.js'

export type MaskCriterion = {
	value: string | RegExp
	replaceWith?: string
}

export namespace createSpec {
	export type Context = Spec.Context & {
		maskCriteria: MaskCriterion[]
	}
}
export namespace Recorder {
	export type Context = {
		plugins: SpecPlugin.Instance[]
		timeTracker: TimeTracker
		log: Logger
		record: SpecRecorderBuilder
		state: State
		spyOptions: SpyOption[]
		maskCriteria: MaskCriterion[]
	}

	export type State = {
		ref: SpecRecordLive.Reference
		refId: SpecRecord.ReferenceId
		source?: SpecRecord.ReferenceSource
	}
	export type SpyOption = {
		subject: any
		options: SpecPlugin.SpyContext.setSpyOptions.Options
	}
}

export type SpecRecordLive = {
	refs: SpecRecordLive.Reference[]
	actions: SpecRecordLive.Action[]
}

export namespace SpecRecordLive {
	export type Reference = SpecRecord.Reference & {
		/**
		 * The actual subject of the reference.
		 */
		subject?: any
		/**
		 * A masked version of the subject.
		 */
		masked?: any
		/**
		 * The test double (spy, or stub) or the subject.
		 * Created by a specific plugin.
		 */
		testDouble?: any
		/**
		 * Not being used atm. May remove.
		 */
		overrideProfiles: SpecRecord.SubjectProfile[]
	}
	export type Action = SpecRecord.Action

	export type State = {
		ref: Reference
		refId: SpecRecord.ReferenceId
		spyOptions: SpyOption[]
		source?: SpecRecord.ReferenceSource
	}
	export type SpyOption = {
		subject: any
		options: {
			plugin?: string
			profile?: SpecRecord.SubjectProfile
		}
	}
}
