import { pick } from 'type-plus';
import { SpecContext } from '../context';
import { getPlugin } from '../plugin';
import { createRecordingRecord } from './createRecordingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { SpecOptions, Spec } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';

export async function createSaveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  const recorder = createSpecRecorder(id, subject, options)
  return {
    subject: recorder.subject,
    async done() {
      await recorder.end()
      return context.io.writeSpec(id, recorder.getRecord())
    }
  }
}

function createSpecRecorder<T>(id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const received: SpecRecordLive = { refs: [], actions: [] }
  const record = createRecordingRecord(received, options)

  return {
    subject: getSpy({ record }, subject, true),
    end: async () => record.end(),
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
