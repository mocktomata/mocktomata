import { Omit } from 'type-plus';
import { createTimeTracker, log } from '../util';
import { addRef, getRef, getRefId } from './SpecRecord';
import { SpecAction, SpecOptions } from './types';
import { SpecReferenceLive } from './typesInternal';

export type RecordingRecord = ReturnType<typeof createRecordingRecord>

export type RecordingRecordContext = {
  refs: SpecReferenceLive[],
  actions: SpecAction[]
}

export function createRecordingRecord({ refs, actions }: RecordingRecordContext, options: SpecOptions) {
  const time = createTimeTracker(options, () => {
    log.warn(`done() was not called in ${options.timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
  })

  return {
    addRef: (ref: SpecReferenceLive) => addRef(refs, ref),
    getRefId: (spy: any) => getRefId(refs, spy),
    addAction: (plugin: string, action: Omit<SpecAction, 'tick'>) => actions.push({ ...action, tick: time.elaspe() }) - 1,
    end: () => { time.stop() },
    getSubject: (ref: string | number) => getRef({ refs, actions }, ref).subject
  }
}
