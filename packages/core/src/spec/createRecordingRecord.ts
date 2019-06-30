import { Omit, pick } from 'type-plus';
import { getPlugin } from '../plugin';
import { createTimeTracker, log } from '../util';
import { addAction, addReference, findTarget, getRef, findRefIdByTarget } from './SpecRecord';
import { SpecAction, SpecOptions } from './types';
import { SpecReferenceLive } from './typesInternal';

export type RecordingRecord = Omit<ReturnType<typeof createRecordingRecord>, 'getRecord'>

export type RecordingRecordContext = {
  refs: SpecReferenceLive[],
  actions: SpecAction[]
}

export function createRecordingRecord(options: SpecOptions) {
  const refs: SpecReferenceLive[] = []
  const actions: SpecAction[] = []
  const time = createTimeTracker(options, () => {
    log.warn(`done() was not called in ${options.timeout} ms. Did the test takes longer than expected or you forget to call done()?`)
  })

  return {
    addRef: (ref: SpecReferenceLive) => addReference(refs, ref),
    addAction: (action: Omit<SpecAction, 'tick'>) => addAction(actions, { ...action, tick: time.elaspe() }),
    end: () => { time.stop() },
    getRecord: () => ({
      refs: refs.map(ref => {
        if (ref.specTarget) {
          return pick(ref, 'plugin', 'subject', 'specTarget')
        }
        return {
          ...pick(ref, 'plugin'),
          subject: createRepresentation(refs, ref)
        }
      }),
      actions
    }),
    getRefId: (spy: any) => findRefIdByTarget(refs, spy),
    getSubject: (ref: string | number) => getRef({ refs, actions }, ref)!.subject,
    findTarget: <T>(subject: T) => findTarget(refs, subject),
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
