import { PartialExcept, Pick } from 'type-plus';
import { assertMatchingAction } from './assertMatchingAction';
import { createTimeTracker } from './createTimeTracker';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findTestDouble, getRef, getSubject, resolveRefId, findRefId } from './mockRecordFns';
import { ActionId, ReferenceId, SpecAction, SpecActionBase, SpecOptions, SpecRecord, SpecReference, InvokeAction } from './types';

export type ValidateRecord = ReturnType<typeof createValidateRecord>

export function createValidateRecord(id: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const actual: SpecRecord = { refs: [], actions: [] }
  const addActionListeners: Array<() => void> = []

  let ended = false
  const record = {
    addRef: (ref: PartialExcept<SpecReference, 'plugin'>) => {
      assertNotAddingExtraReference(id, original.refs, actual.refs, ref)
      const nextRef = getExpectedReference(original.refs, actual.refs)
      assertMatchingReference(id, ref, nextRef)

      return addRef(actual.refs, { ...ref, mode: nextRef.mode })
    },
    /**
     * NOTE: not expected to return undefined.
     */
    getRef: (id: ReferenceId | ActionId) => getRef(actual, id)!,
    findRefId: (spy: any) => findRefId(actual.refs, spy),
    getExpectedReference: () => getExpectedReference(original.refs, actual.refs),
    getOriginalRef: (id: ReferenceId | ActionId) => getRef(original, id),
    addAction: (action: SpecActionBase) => {
      assertNotAddingWhenEnded(id, actual, ended, action)
      const expected = record.getExpectedAction()
      assertMatchingAction(id, actual, action, expected)

      const mergedAction = { ...expected, ...action, tick: time.elaspe() } as SpecAction
      const actionId = addAction(actual.actions, mergedAction)
      addActionListeners.forEach(l => l())

      return actionId
    },
    onAddAction: (listener: () => void) => {
      addActionListeners.push(listener)
    },
    getExpectedAction: () => getExpectedAction(original, actual),
    getExpectedActionId: () => actual.actions.length,
    getSubject: (id: ReferenceId | ActionId) => getSubject(original, actual, id),
    findTestDouble: <S>(subject: S) => findTestDouble(actual.refs, subject),
    resolveRefId: (ref: ReferenceId | ActionId) => resolveRefId(actual, ref),
    end() {
      ended = true
      time.stop()
      assertReceivedAllExpectedActions(id, original, actual)
    },
  }

  return record
}

function assertNotAddingExtraReference(specId: string, loadedRefs: SpecReference[], receivedRefs: SpecReference[], ref: Pick<SpecReference, 'plugin'>) {
  if (receivedRefs.length >= loadedRefs.length) throw new ReferenceMismatch(specId, undefined, ref)
}
function assertMatchingReference(specId: string, actual: Pick<SpecReference, 'plugin'>, expected: Pick<SpecReference, 'plugin'>) {
  if (actual.plugin !== expected.plugin) throw new ReferenceMismatch(specId, expected, actual)
}

function getExpectedReference(expected: SpecReference[], actual: SpecReference[]) {
  return expected[actual.length]
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

export function assertActionType(specId: string, type: SpecAction['type'], action: SpecAction): action is InvokeAction {
  if (action.type !== 'invoke') {
    throw new ActionMismatch(specId, { type: 'invoke' }, action)
  }
  return false
}
