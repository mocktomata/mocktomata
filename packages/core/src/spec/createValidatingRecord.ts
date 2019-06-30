import { Omit } from 'type-plus';
import { getPlugin, PluginNotFound } from '../plugin';
import { createTimeTracker } from '../util';
import { createPluginReplayer } from './createSpecPlayer';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { addReference, findTarget, getRef, findRefIdByTarget, resolveRefId, addAction } from './SpecRecord';
import { createSpecSimulator } from './SpecSimulator';
import { SpecAction, SpecOptions, SpecRecord, SpecReference } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';

export type ValidatingRecord = ReturnType<typeof createValidatingRecord>

/**
 * Validate if the action occured matches the recorded actions.
 */
export function createValidatingRecord(specId: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options)
  const listeners: { ref: number, listener: () => void }[] = []
  const received: SpecRecordLive = { refs: [], actions: [] }
  let ended = false
  const record = {
    specId,
    addRef: (ref: SpecReferenceLive) => {
      if (received.refs.length >= original.refs.length) throw new ReferenceMismatch(specId, undefined, ref)

      const expected = original.refs[received.refs.length]
      if (ref.plugin !== expected.plugin) throw new ReferenceMismatch(specId, expected, ref)

      const plugin = getPlugin(expected.plugin)
      if (!plugin) throw new PluginNotFound(expected.plugin)

      return addReference(received.refs, ref)
    },
    addAction(action: Omit<SpecAction, 'tick'>) {
      if (ended) {
        const plugin = getRef(received, action.ref)!.plugin
        throw new ActionMismatch(specId, undefined, { type: action.type, plugin })
      }

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
      simulator.process()
      return id
    },
    end() {
      ended = true
      time.stop()
      if (original.actions.length > received.actions.length) {
        const expectedAction = original.actions[received.actions.length]
        const plugin = getRef(original, expectedAction.ref)!.plugin
        throw new ActionMismatch(specId, { type: expectedAction.type, plugin }, undefined)
      }
    },
    logReceived() {
      console.info('received', received)
    },
    getRefId: (stub: any) => findRefIdByTarget(received.refs, stub),
    getRef: (ref: string | number) => getRef(received, ref),
    resolveRef: (ref: string | number) => resolveRef(record, original, received, ref),
    peekAction() {
      return received.actions.length < original.actions.length ?
        original.actions[received.actions.length] :
        undefined
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
  const simulator = createSpecSimulator(record, options)
  return record
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
  const refId = resolveRefId(received, ref)
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
