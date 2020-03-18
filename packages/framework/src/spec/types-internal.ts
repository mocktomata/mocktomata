import { SpecPlugin } from '../spec-plugin/types'
import { SpecRecord } from '../spec-record/types'
import { TimeTracker } from '../timeTracker/createTimeTracker'
import { SpecRecorderBuilder } from './record'
import { Spec } from './types'

export type MaskCriterion<V extends number | string = any> = MaskNumberCriterion | MaskStringCriterion | MaskRegExpCriterion | MaskPredicateCriterion<V>

export type MaskNumberCriterion = {
  value: number, replaceWith?: number | ((value: number) => number)
}

export type MaskStringCriterion = {
  value: string, replaceWith?: string | ((value: string) => string)
}

export type MaskRegExpCriterion = {
  value: RegExp, replaceWith?: string | ((value: RegExpExecArray) => string)
}

export type MaskPredicateCriterion<V extends number | string> = {
  value: (value: V) => boolean, replaceWith?: V | ((value: V) => V)
}

export namespace createSpec {
  export type Context = Spec.Context & {
    maskCriteria: MaskCriterion[]
  }
}
export namespace Recorder {
  export type Context = {
    plugins: SpecPlugin.Instance[],
    timeTracker: TimeTracker,
    record: SpecRecorderBuilder,
    state: State,
    spyOptions: SpyOption[],
    maskCriteria: MaskCriterion[],
  }

  export type State = {
    ref: SpecRecordLive.Reference,
    refId: SpecRecord.ReferenceId,
    source?: SpecRecord.ReferenceSource,
  }
  export type SpyOption = {
    subject: any,
    options: SpecPlugin.SpyContext.setSpyOptions.Options
  }
}

export type SpecRecordLive = {
  refs: SpecRecordLive.Reference[],
  actions: SpecRecordLive.Action[]
}

export namespace SpecRecordLive {
  export type Reference = SpecRecord.Reference & {
    overrideProfiles: SpecRecord.SubjectProfile[],
  }
  export type Action = SpecRecord.Action

  export type State = {
    ref: Reference,
    refId: SpecRecord.ReferenceId,
    spyOptions: SpyOption[],
    source?: SpecRecord.ReferenceSource,
  }
  export type SpyOption = {
    subject: any,
    options: {
      plugin?: string,
      profile?: SpecRecord.SubjectProfile,
    }
  }
}
