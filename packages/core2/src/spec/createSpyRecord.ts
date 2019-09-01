import { Omit } from 'type-plus';
import { createTimeTracker } from './createTimeTracker';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findTestDouble, getRef } from './mockRecordFns';
import { ActionId, ReferenceId, SpecAction, SpecOptions, SpecReference } from './types';

export type SpyRecord = ReturnType<typeof createSpyRecord>

export function createSpyRecord(options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const refs: SpecReference[] = []
  const actions: SpecAction[] = []
  return {
    addRef: (ref: SpecReference) => addRef(refs, ref),
    /**
     * NOTE: not expected to return undefined.
     */
    getRef: (ref: ReferenceId | ActionId) => getRef({ refs, actions }, ref)!,
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(actions, { ...action, tick: time.elaspe() }),
    end: () => { time.stop() },
    findTestDouble: <S>(subject: S) => findTestDouble(refs, subject),
    getSubject: (ref: string | number) => getRef({ refs, actions }, ref)!.subject,
    getSpecRecord: () => ({ refs, actions })
  }
}
