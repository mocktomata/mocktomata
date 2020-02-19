import { SpecPlugin } from '../spec-plugin/types'
import { TimeTracker } from './createTimeTracker'
import { SpecRecorderBuilder } from './record'
import { SpecRecord } from './types'

export namespace Recorder {
  export type Context = {
    timeTracker: TimeTracker,
    record: SpecRecorderBuilder,
    state: State,
  }

  export type State = {
    ref: SpecRecordLive.Reference,
    refId: SpecRecord.ReferenceId,
    spyOptions: Array<{ subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options }>,
    source?: SpecRecord.ReferenceSource,
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
