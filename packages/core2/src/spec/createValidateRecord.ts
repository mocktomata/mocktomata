import { PartialPick, PartialExcept } from 'type-plus';
import { createTimeTracker } from './createTimeTracker';
import { ReferenceMismatch } from './errors';
import { logRecordingTimeout } from './logs';
import { addRef, findTestDouble } from './mockRecordFns';
import { SpecOptions, SpecRecord, SpecReference } from './types';

export type ValidateRecord = ReturnType<typeof createValidateRecord>

export function createValidateRecord(id: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const received: SpecRecord = { refs: [], actions: [] }

  return {
    addRef: (ref: PartialExcept<SpecReference, 'plugin'>) => {
      assertNotAddingExtraReference(id, original.refs, received.refs, ref)
      const expectedRef = getExpectedReference(original.refs, received.refs)
      assertMatchingReference(id, ref, expectedRef)

      return addRef(received.refs, { ...ref, mode: expectedRef.mode })
    },
    findTestDouble: <S>(subject: S) => findTestDouble(received.refs, subject),
  }
}

function assertNotAddingExtraReference(specId: string, loadedRefs: SpecReference[], receivedRefs: SpecReference[], ref: Pick<SpecReference, 'plugin'>) {
  if (receivedRefs.length >= loadedRefs.length) throw new ReferenceMismatch(specId, undefined, ref)
}
function assertMatchingReference(specId: string, actual: Pick<SpecReference, 'plugin'>, expected: Pick<SpecReference, 'plugin'>) {
  if (actual.plugin !== expected.plugin) throw new ReferenceMismatch(specId, expected, actual)
}

function getExpectedReference(loadedRefs: SpecReference[], receviedRefs: SpecReference[]) {
  return loadedRefs[receviedRefs.length]
}
