import { PartialExcept, Pick } from 'type-plus';
import { assertMatchingAction } from './assertMatchingAction';
import { createTimeTracker } from './createTimeTracker';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { logRecordingTimeout } from './logs';
import { addAction, addRef, findRef, findRefId, findTestDouble, getRef, resolveRefId } from './mockRecordFns';
import { ActionId, InvokeAction, ReferenceId, SpecAction, SpecActionBase, SpecOptions, SpecRecord, SpecReference } from './types';

export type ValidateRecord = ReturnType<typeof createValidateRecord>

export function createValidateRecord(specId: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
  const actual: SpecRecord = { refs: [], actions: [] }
  const addActionListeners: Array<() => void> = []

  let ended = false
  const record = {
    specId,
    original,
    actual,
    addRef: (ref: PartialExcept<SpecReference, 'plugin'>) => {
      assertNotAddingExtraReference(specId, original.refs, actual.refs, ref)
      const nextRef = record.getExpectedReference()
      assertMatchingReference(specId, ref, nextRef)

      ref.mode = nextRef.mode
      return addRef(actual.refs, ref as any)
    },
    getRef: (id: ReferenceId | ActionId) => getRef(actual, id),
    getRefId: (ref: SpecReference) => String(actual.refs.findIndex(r => r === ref)),
    findRef: (subjectOrTestDouble: any) => findRef(actual.refs, subjectOrTestDouble),
    findRefId: (spy: any) => findRefId(actual.refs, spy),
    getExpectedReference: () => getExpectedReference(original.refs, actual.refs),
    getOriginalRef: (id: ReferenceId | ActionId) => getRef(original, id),
    getOriginalRefId: (id: ReferenceId | ActionId) => getRef(original, id),
    getNextActionId: () => actual.actions.length,
    addAction: (action: Omit<SpecAction, 'tick'>) => {
      assertNotAddingWhenEnded(specId, actual, ended, action)
      const expected = record.getExpectedAction()
      assertMatchingAction(specId, actual, action, expected)

      const mergedAction = { ...expected, ...action, tick: time.elaspe() } as SpecAction
      const actionId = addAction(actual.actions, mergedAction)
      addActionListeners.forEach(l => l())

      return actionId
    },
    onAddAction: (listener: () => void) => {
      addActionListeners.push(listener)
    },
    getAction: <A = SpecAction>(id: ActionId): A => actual.actions[id]! as any as A,
    getExpectedAction: () => getExpectedAction(original, actual),
    getExpectedActionId: () => actual.actions.length,
    getSubject: (id: ReferenceId | ActionId) => getSubject(record, id),
    findTestDouble: <S>(subject: S) => findTestDouble(actual.refs, subject),
    resolveRefId: (ref: ReferenceId | ActionId) => resolveRefId(actual, ref),
    end() {
      ended = true
      time.stop()
      assertReceivedAllExpectedActions(specId, original, actual)
    },
  }

  return record
}

function assertNotAddingExtraReference(specId: string, loadedRefs: SpecReference[], receivedRefs: SpecReference[], ref: Pick<SpecReference, 'plugin'>) {
  if (receivedRefs.length >= loadedRefs.length) throw new ReferenceMismatch(specId, ref, undefined)
}
function assertMatchingReference(specId: string, actual: Pick<SpecReference, 'plugin'>, expected: Pick<SpecReference, 'plugin'>) {
  if (actual.plugin !== expected.plugin) throw new ReferenceMismatch(specId, actual, expected)
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
  if (action.type !== type) {
    throw new ActionMismatch(specId, { type }, action)
  }
  return false
}

function getSubject(record: ValidateRecord, refOrValue: any) {
  if (typeof refOrValue !== 'string') return refOrValue

  const receivedRef = record.getRef(refOrValue)
  if (receivedRef) return receivedRef.subject

  return undefined
  // const origRef = record.getOriginalRef(refOrValue)
  // return recreateSubject({ record, contextTracker }, origRef)
}

// function recreateSubject({ record, contextTracker }: StubContextInternal, ref: SpecReference | undefined): any {
//   if (ref && ref.meta) {
//     const plugin = findPlugin(ref.plugin)
//     if (!plugin) throw new PluginNotFound(ref.plugin)
//     const refId = record.getRefId(ref)
//     return plugin.createStub(createStubContext({ record, contextTracker }, plugin.name, refId), ref.meta)
//   }
//   return undefined
// }
