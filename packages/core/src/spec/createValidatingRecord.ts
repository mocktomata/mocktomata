import { Omit } from 'type-plus';
import { getPlugin, PluginNotFound } from '../plugin';
import { createTimeTracker } from '../util';
import { createPluginReplayer } from './createSpecPlayer';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { addAction, addReference, findRefIdByTarget, findTarget, getRef, resolveRefId } from './SpecRecord';
import { SpecAction, SpecOptions, SpecRecord, SpecReference } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';

export type ValidatingRecord = ReturnType<typeof createValidatingRecord>

/**
 * Validate if the action occured matches the recorded actions.
 */
export function createValidatingRecord(specId: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options)
  const addActionListeners: Array<() => void> = []
  const listeners: { ref: number, listener: () => void }[] = []
  const received: SpecRecordLive = { refs: [], actions: [] }
  let ended = false
  const record = {
    specId,
    addRef: (ref: SpecReferenceLive) => {
      assertNotAddingExtraReference(specId, original.refs, received.refs, ref)
      assertMatchingReference(specId, ref, getExpectedReference(original.refs, received.refs))
      return addReference(received.refs, ref)
    },
    addAction(action: Omit<SpecAction, 'tick'>) {
      assertNotAddingWhenEnded(specId, received, ended, action)

      const id = addAction(received.actions, { ...action, tick: time.elaspe() })

      // listener and simulator is misplaced. Validating record should not handle those.
      listeners.forEach(({ ref, listener }) => {
        const next = this.peekAction()
        if (next) {
          if (ref === next.ref) {
            listener()
          }
        }
      })
      addActionListeners.forEach(l => l())
      return id
    },
    end() {
      ended = true
      time.stop()
      assertReceivedAllExpectedActions(specId, original, received)
    },
    onAddAction(listener: () => void) {
      addActionListeners.push(listener)
    },
    /**
     * Show the received record. For debugging purpose only.
     */
    logReceived() {
      console.info('received', received)
    },
    resolveRefId: (ref: string | number) => resolveRefId(received, ref),
    getRefId: (stub: any) => findRefIdByTarget(received.refs, stub),
    getRef: (ref: string | number) => getRef(received, ref),
    resolveRef: (ref: string | number) => resolveRef(record, original, received, ref),
    peekAction() {
      return received.actions.length < original.actions.length ?
        original.actions[received.actions.length] :
        undefined
    },
    peekActionId() {
      return received.actions.length
    },
    onAction(ref: number, listener: () => void) {
      listeners.push({
        ref,
        listener
      })
    },
    getSubject: (refOrValue: any) => getSubject(original, received, refOrValue),
    findTarget: <T>(subject: T) => findTarget(received.refs, subject),
  }
  return record
}

function assertNotAddingExtraReference(specId: string, loadedRefs: SpecReference[], receivedRefs: SpecReferenceLive[], ref: SpecReferenceLive) {
  if (receivedRefs.length >= loadedRefs.length) throw new ReferenceMismatch(specId, undefined, ref)
}

function getExpectedReference(loadedRefs: SpecReference[], receviedRefs: SpecReferenceLive[]) {
  return loadedRefs[receviedRefs.length]
}

function assertMatchingReference(specId: string, actual: SpecReference, expected: SpecReference) {
  if (actual.plugin !== expected.plugin) throw new ReferenceMismatch(specId, expected, actual)
}

function assertNotAddingWhenEnded(specId: string, received: SpecRecordLive, ended: boolean, action: Pick<SpecAction, 'type' | 'ref'>) {
  if (ended) {
    const plugin = getRef(received, action.ref)!.plugin
    throw new ActionMismatch(specId, undefined, { type: action.type, plugin })
  }
}

function assertReceivedAllExpectedActions(specId: string, original: SpecRecord, received: SpecRecordLive) {
  if (original.actions.length > received.actions.length) {
    const expectedAction = original.actions[received.actions.length]
    const plugin = getRef(original, expectedAction.ref)!.plugin
    throw new ActionMismatch(specId, { type: expectedAction.type, plugin }, undefined)
  }
}

function getSubject(original: SpecRecord, received: SpecRecordLive, refOrValue: any): any {
  if (typeof refOrValue !== 'string') return refOrValue

  const receivedRef = getRef(received, refOrValue)
  if (receivedRef) return receivedRef.subject

  const origRef = getRef(original, refOrValue)
  return recreateSubject(original, received, origRef)
}

function recreateSubject(original: SpecRecord, received: SpecRecord, ref: SpecReference | undefined) {
  if (ref && ref.subject) {
    const plugin = getPlugin(ref.plugin)
    if (!plugin) throw new PluginNotFound(ref.plugin)

    if (plugin.recreateSubject) {
      return plugin.recreateSubject({ process: (input) => getSubject(original, received, input) }, ref.subject)
    }
    return ref.subject
  }
  return undefined
}

function resolveRef(record: ValidatingRecord, original: SpecRecord, received: SpecRecord, ref: string | number): SpecReferenceLive {
  const refId = Number(resolveRefId(received, ref))
  if (received.refs[refId]) return received.refs[refId]

  const specRef = original.refs[refId]
  if (specRef && specRef.subject) {
    const plugin = getPlugin(specRef.plugin)
    if (!plugin) throw new PluginNotFound(specRef.plugin)

    const subject = plugin.recreateSubject ?
      plugin.recreateSubject({ process: (input) => getSubject(original, received, input) }, specRef.subject) :
      specRef.subject
    const player = createPluginReplayer(record, plugin.name, subject, false)
    plugin.createStub({ player }, subject)
  }
  return getRef(received, ref)!
}
