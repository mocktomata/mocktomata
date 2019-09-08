import { Omit, pick } from 'type-plus';
import { createTimeTracker } from './createTimeTracker';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findRef, findRefId, findTestDouble, getRef } from './mockRecordFns';
import { ActionId, ReferenceId, SpecAction, SpecOptions, SpecReference } from './types';

export type SpyRecord = ReturnType<typeof createSpyRecord>

export function createSpyRecord(specId: string, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const refs: SpecReference[] = []
  const actions: SpecAction[] = []
  return {
    specId,
    addRef: (ref: SpecReference) => addRef(refs, ref),
    /**
     * NOTE: not expected to return undefined.
     */
    getRef: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id)!,
    findRef: (subjectOrTestDouble: any) => findRef(refs, subjectOrTestDouble),
    findRefId: (spy: any) => findRefId(refs, spy),
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(actions, { ...action, tick: time.elaspe() }),
    getSubject: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id)!.subject,
    findTestDouble: <S>(subjectOrTestDouble: S) => findTestDouble(refs, subjectOrTestDouble),
    getSpecRecord: () => ({
      refs: refs.map(r => pick(r, 'plugin', 'mode', 'meta', 'source')),
      actions
    }),
    end: () => { time.stop() },
  }
}
