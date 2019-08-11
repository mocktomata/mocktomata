import { pick } from 'type-plus';
import { SpecContext } from '../context';
import { getPlugin } from '../plugin';
import { createRecordingRecord } from './createRecordingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { SpecOptions, Spec, SpecRecord } from './types';
import { SpecRecordLive, SpecReferenceLive } from './types-internal';

export async function createSaveSpec<T>(context: SpecContext, id: string, subject: T, options: SpecOptions): Promise<Spec<T>> {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const received: SpecRecordLive = { refs: [], actions: [] }
  const record = createRecordingRecord(received, options)

  return {
    subject: getSpy({ record }, subject, true),
    async done() {
      record.end()
      return context.io.writeSpec(id, toSpecRecord(received))
    }
  }
}

function toSpecRecord({ refs, actions }: SpecRecordLive): SpecRecord {
  return {
    refs: refs.map(ref => ref.specTarget ?
      pick(ref, 'plugin', 'subject', 'specTarget') :
      {
        ...pick(ref, 'plugin'),
        subject: createSubjectRepresentation(refs, ref)
      }),
    actions
  }
}

function createSubjectRepresentation(refs: SpecReferenceLive[], ref: SpecReferenceLive): any {
  const plugin = getPlugin(ref.plugin)

  if (plugin && plugin.createRepresentation) {
    return plugin.createRepresentation({
      process: (subject) => {
        const refId = refs.findIndex(r => r.subject === subject)
        return refId !== -1 ? String(refId) : subject
      }
    }, ref.subject)
  }
  else return ref.subject
}
