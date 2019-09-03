import { Omit } from 'type-plus';
import { createTimeTracker } from './createTimeTracker';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findTestDouble, getRef, findRefId } from './mockRecordFns';
import { ActionId, ReferenceId, SpecAction, SpecOptions, SpecReference } from './types';

export type SpyRecord = ReturnType<typeof createSpyRecord>

export function createSpyRecord(options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const refs: SpecReference[] = []
  const actions: SpecAction[] = []
  return {
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(actions, { ...action, tick: time.elaspe() }),
    addRef: (ref: SpecReference) => addRef(refs, ref),
    /**
     * NOTE: not expected to return undefined.
     */
    getRef: (ref: ReferenceId | ActionId) => getRef({ refs, actions }, ref)!,
    findRefId: (spy: any) => findRefId(refs, spy),
    getSubject: (ref: string | number) => getRef({ refs, actions }, ref)!.subject,
    findTestDouble: <S>(subject: S) => findTestDouble(refs, subject),
    getSpecRecord: () => ({ refs, actions }),
    end: () => { time.stop() },
  }
}
