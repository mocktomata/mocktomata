import { Omit } from 'type-plus';
import { createTimeTracker } from '../util';
import { logRecordingTimeout } from './log';
import { addAction, addReference, findRefByTarget, findRefIdByTarget, findSourceInfo, findTarget, getRef } from './SpecRecord';
import { SpecAction, SpecOptions } from './types';
import { SpecRecordLive, SpecReferenceLive } from './types-internal';

export type RecordingRecord = ReturnType<typeof createRecordingRecord>

export type RecordingRecordContext = {
  refs: SpecReferenceLive[],
  actions: SpecAction[]
}

export function createRecordingRecord(received: SpecRecordLive, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))

  return {
    addRef: (ref: SpecReferenceLive) => addReference(received.refs, ref),
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(received.actions, { ...action, tick: time.elaspe() }),
    end: () => { time.stop() },
    getRefByTarget: (spy: any) => findRefByTarget(received.refs, spy)!,
    getRefId: (spy: any) => findRefIdByTarget(received.refs, spy),
    getSubject: (ref: string | number) => getRef(received, ref)!.subject,
    findTarget: <T>(subject: T) => findTarget(received.refs, subject),
    findSourceInfo: (subject: any) => findSourceInfo(received.refs, subject)
  }
}
