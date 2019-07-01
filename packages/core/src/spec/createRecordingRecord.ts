import { Omit, pick } from 'type-plus';
import { getPlugin } from '../plugin';
import { createTimeTracker } from '../util';
import { logRecordingTimeout } from './log';
import { addAction, addReference, findRefIdByTarget, findTarget, getRef } from './SpecRecord';
import { SpecAction, SpecOptions } from './types';
import { SpecReferenceLive, SpecRecordLive } from './typesInternal';

export type RecordingRecord = Omit<ReturnType<typeof createRecordingRecord>, 'getRecord'>

export type RecordingRecordContext = {
  refs: SpecReferenceLive[],
  actions: SpecAction[]
}

export function createRecordingRecord(options: SpecOptions) {
  const received: SpecRecordLive = { refs: [], actions: [] }
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))

  return {
    addRef: (ref: SpecReferenceLive) => addReference(received.refs, ref),
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(received.actions, { ...action, tick: time.elaspe() }),
    end: () => { time.stop() },
    getRecord: () => ({
      refs: received.refs.map(ref => {
        if (ref.specTarget) {
          return pick(ref, 'plugin', 'subject', 'specTarget')
        }
        return {
          ...pick(ref, 'plugin'),
          subject: createRepresentation(received.refs, ref)
        }
      }),
      actions: received.actions
    }),
    getRefId: (spy: any) => findRefIdByTarget(received.refs, spy),
    getSubject: (ref: string | number) => getRef(received, ref)!.subject,
    findTarget: <T>(subject: T) => findTarget(received.refs, subject),
  }
}

function createRepresentation(refs: SpecReferenceLive[], ref: SpecReferenceLive): any {
  const plugin = getPlugin(ref.plugin)

  if (plugin && plugin.createRepresentation) {
    return plugin.createRepresentation({
      process: (subject) => {
        const refId = refs.findIndex(r => r.subject === subject)
        if (refId !== -1) return String(refId)
        return subject
      }
    }, ref.subject)
  }
  else {
    return ref.subject
  }
}
