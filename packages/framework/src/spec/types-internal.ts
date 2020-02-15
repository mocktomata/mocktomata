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
    ref: SpecRecord.Reference,
    refId: SpecRecord.ReferenceId,
    spyOptions: Array<{ subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options }>,
    source?: SpecRecord.ReferenceSource,
  }
}
