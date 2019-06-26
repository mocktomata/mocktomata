import { pick } from 'type-plus';
import { getPlugin } from '../plugin';
import { createRecordingRecord } from './createRecordingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { SpecAction, SpecOptions } from './types';
import { SpecReferenceLive } from './typesInternal';

export function createSpecRecorder<T>(id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const refs: SpecReferenceLive[] = []
  const actions: SpecAction[] = []

  const record = createRecordingRecord({ refs, actions }, options)

  return {
    subject: getSpy({ record }, subject, true),
    end: async () => record.end(),
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
    })
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
