import { SpecPlugin } from '../spec-plugin/types'
import { SpecRecord } from '../spec-record/types'
import { TimeTracker } from '../timeTracker/createTimeTracker'
import { SpecRecorderBuilder } from './record'

export namespace Recorder {
  export type Context = {
    plugins: SpecPlugin.Instance[],
    timeTracker: TimeTracker,
    record: SpecRecorderBuilder,
    state: State,
    spyOptions: Array<SpyOption>,
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
