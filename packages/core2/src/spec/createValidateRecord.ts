import { Omit, PartialExcept, Pick } from 'type-plus';
import { assertMatchingAction } from './assertMatchingAction';
import { createTimeTracker } from './createTimeTracker';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findTestDouble, getRef, getSubject } from './mockRecordFns';
import { ActionId, ReferenceId, SpecAction, SpecActionBase, SpecOptions, SpecRecord, SpecReference } from './types';

export type ValidateRecord = ReturnType<typeof createValidateRecord>

export function createValidateRecord(id: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const received: SpecRecord = { refs: [], actions: [] }

  let ended = false
  const record = {
    addRef: (ref: PartialExcept<SpecReference, 'plugin'>) => {
      assertNotAddingExtraReference(id, original.refs, received.refs, ref)
      const origRef = getExpectedReference(original.refs, received.refs)
      assertMatchingReference(id, ref, origRef)

      return addRef(received.refs, { ...ref, mode: origRef.mode })
    },
    getExpectedReference: () => getExpectedReference(original.refs, received.refs),
    getOriginalRef: (ref: ReferenceId) => getRef(original, ref),
    /**
     * NOTE: not expected to return undefined.
     */
    getRef: (ref: ReferenceId | ActionId) => getRef(received, ref)!,
    getSubject: (ref: ReferenceId | ActionId) => getSubject(original, received, ref),
    addAction: (action: SpecActionBase) => {
      assertNotAddingWhenEnded(id, received, ended, action)
      const expected = record.getExpectedAction()
      assertMatchingAction(id, received, action, expected)

      const mergedAction = { ...expected, ...action, tick: time.elaspe() } as SpecAction
      return addAction(received.actions, mergedAction)
    },
    getExpectedAction: () => getExpectedAction(original, received),
    end() {
      ended = true
      time.stop()
      assertReceivedAllExpectedActions(id, original, received)
    },
    findTestDouble: <S>(subject: S) => findTestDouble(received.refs, subject),
  }

  return record
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

function assertNotAddingWhenEnded(specId: string, received: SpecRecord, ended: boolean, action: SpecActionBase) {
  if (ended) {
    const plugin = getRef(received, action.ref)!.plugin
    throw new ActionMismatch(specId, { ...action, plugin }, undefined)
  }
}

function assertReceivedAllExpectedActions(specId: string, original: SpecRecord, received: SpecRecord) {
  if (original.actions.length > received.actions.length) {
    const expectedAction = getExpectedAction(original, received)
    const plugin = getRef(original, expectedAction.ref)!.plugin
    throw new ActionMismatch(specId, undefined, { ...expectedAction, plugin })
  }
}

function getExpectedAction(original: SpecRecord, received: SpecRecord) {
  return original.actions[received.actions.length]
}
