import { Omit } from 'type-plus';
import { getPlugin, PluginNotFound } from '../plugin';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { getRefId } from './SpecRecord';
import { SpecAction, SpecRecord, SpecOptions } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';
import { createTimeTracker, log } from '../util';
import { createSpecSimulator } from './SpecSimulator';

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
    getSubject: (refOrValue: any) => typeof refOrValue !== 'string' ?
      refOrValue : getSubject(original.refs, refOrValue),
    addAction(plugin: string, action: Omit<SpecAction, 'tick'>) {
      if (ended) throw new ActionMismatch(specId, undefined, { type: action.type, plugin })

      const newAction = { ...action, tick: time.elaspe() }
      const id = received.actions.push(newAction)
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

function getSubject(refs: SpecReferenceLive[], ref: string) {
  const i = Number(ref)
  const entry = refs[i]
  const plugin = getPlugin(entry.plugin)
  if (!plugin) throw new PluginNotFound(entry.plugin)

  if (plugin.deserialize) {
    return plugin.deserialize(entry.subject)
  }
  return entry.subject
}

function getRef({ refs, actions }: SpecRecordLive, ref: string | number) {
  while (typeof ref === 'number') {
    ref = actions[ref].ref
  }
  return refs[Number(ref)]
}
