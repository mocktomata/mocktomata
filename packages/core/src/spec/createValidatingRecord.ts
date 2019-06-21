import { Omit } from 'type-plus';
import { getPlugin, PluginNotFound } from '../plugin';
import { createTimeTracker } from '../util';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { getRef, getRefId } from './SpecRecord';
import { createSpecSimulator } from './SpecSimulator';
import { SpecAction, SpecOptions, SpecRecord } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';

export type ValidatingRecord = ReturnType<typeof createValidatingRecord>

// NOTE: This version we only support straight/identical flow.
// i.e. the reference sequence and action sequence must be identical to the original.
// In the next version we can explore creating a state machine to support off sequence calls,
// as long as the resulting state is compatible.
// Such system would better support asynchronous or random invocation performed by the consuming logic.
/**
 * Validate if the action occured matches the recorded actions.
 */
export function createValidatingRecord(specId: string, original: SpecRecord, options: SpecOptions) {
  const time = createTimeTracker(options)

  const received: SpecRecordLive = { refs: [], actions: [] }
  let ended = false
  const record = {
    specId,
    addRef(ref: SpecReferenceLive) {
      if (received.refs.length >= original.refs.length) throw new ReferenceMismatch(specId, undefined, ref)

      const expected = original.refs[received.refs.length]
      if (ref.plugin !== expected.plugin) throw new ReferenceMismatch(specId, expected, ref)

      const plugin = getPlugin(expected.plugin)
      if (!plugin) throw new PluginNotFound(expected.plugin)

      received.refs.push(ref)
    },
    getRefId: (stub: any) => getRefId(received.refs, stub),
    getRef: (ref: string | number) => getRef(received, ref),
    getSubject: (refOrValue: any) => getSubject(original, received, refOrValue),
    addAction(plugin: string, action: Omit<SpecAction, 'tick'>) {
      if (ended) throw new ActionMismatch(specId, undefined, { type: action.type, plugin })

      const newAction = { ...action, tick: time.elaspe() }
      const id = received.actions.push(newAction) - 1
      simulator.process()
      return id
      // const expected = this.original.actions[0]

      // throw new ActionMismatch(this.id, expected, action)
    },
    peekAction() {
      return received.actions.length < original.actions.length ?
        original.actions[received.actions.length] :
        undefined
    },
    end() {
      ended = true
      time.stop()
      if (original.actions.length > received.actions.length) {
        const expectedAction = original.actions[received.actions.length]
        const plugin = findPluginNameInOriginal(expectedAction.ref)
        throw new ActionMismatch(specId, { type: expectedAction.type, plugin }, undefined)
      }
    },
    logReceived() {
      console.info('received', received)
    }
  }
  const simulator = createSpecSimulator(record, options)

  return record
  function findPluginNameInOriginal(ref: string | number) {
    while (typeof ref === 'number') {
      ref = original.actions[ref].ref
    }
    return original.refs[Number(ref)].plugin
  }
}

function getSubject(original: SpecRecordLive, received: SpecRecordLive, refOrValue: any) {
  if (typeof refOrValue !== 'string') return refOrValue

  let ref = getRef(original, refOrValue)
  if (ref.subject) {
    const plugin = getPlugin(ref.plugin)
    if (!plugin) throw new PluginNotFound(ref.plugin)

    if (plugin.deserialize) {
      return plugin.deserialize(ref.subject)
    }
    return ref.subject
  }
  else {
    ref = getRef(received, refOrValue)
    return ref.subject
  }
}
