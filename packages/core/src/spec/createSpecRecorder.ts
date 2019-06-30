import { createRecordingRecord } from './createRecordingRecord';
import { NotSpecable } from './errors';
import { getSpy } from './getSpy';
import { isSpecable } from './isSpecable';
import { SpecOptions } from './types';

export function createSpecRecorder<T>(id: string, subject: T, options: SpecOptions) {
  if (!isSpecable(subject)) throw new NotSpecable(subject)

  const record = createRecordingRecord(options)

  return {
    subject: getSpy({ record }, subject, true),
    end: async () => record.end(),
    getRecord: () => record.getRecord()
  }
}
