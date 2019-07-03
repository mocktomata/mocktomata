import { Omit } from 'type-plus';
import { createTimeTracker } from '../util';
import { logRecordingTimeout } from './log';
import { addAction, addReference, findRefIdByTarget, findTarget, getRef } from './SpecRecord';
import { SpecAction, SpecOptions } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';

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
    getRefId: (spy: any) => findRefIdByTarget(received.refs, spy),
    getSubject: (ref: string | number) => getRef(received, ref)!.subject,
    findTarget: <T>(subject: T) => findTarget(received.refs, subject),
  }
}
