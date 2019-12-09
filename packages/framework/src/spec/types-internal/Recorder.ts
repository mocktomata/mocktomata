import { TimeTracker } from '../createTimeTracker'
import { SpecRecorderBuilder } from '../record'
import { SpecPlugin, SpecRecord } from '../types'
import { RequiredPick } from 'type-plus'

export namespace Recorder {
  export type Context<S = State> = {
    timeTracker: TimeTracker,
    record: SpecRecorderBuilder,
    state: S,
  }

  export type State = {
    ref: SpecRecord.Reference,
    refId: SpecRecord.ReferenceId,
    spyOptions: Array<{ subject: any, options: SpecPlugin.SpyContext.setSpyOptions.Options }>,
    actionId?: SpecRecord.ActionId,
    site?: SpecRecord.Site
  }

  export type CauseActionsState = RequiredPick<State, 'actionId'>
}
