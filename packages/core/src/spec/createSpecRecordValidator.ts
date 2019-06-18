import { getPlugin, PluginNotFound } from '../plugin';
import { PluginInstance } from '../plugin/typesInternal';
import { ReferenceMismatch, ActionMismatch } from './errors';
import { SpecAction, SpecRecord } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';
import { endianness } from 'os';

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

// NOTE: This version we only support straight/identical flow.
// i.e. the reference sequence and action sequence must be identical to the original.
// In the next version we can explore creating a state machine to support off sequence calls,
// as long as the resulting state is compatible.
// Such system would better support asynchronous or random invocation performed by the consuming logic.
/**
 * Validate if the action occured matches the recorded actions.
 */
export function createSpecRecordValidator(id: string, original: SpecRecord) {
  const received: SpecRecordLive = { refs: [], actions: [] }
  let ended = false
  return {
    addReference(ref: SpecReferenceLive) {
      if (received.refs.length >= original.refs.length) throw new ReferenceMismatch(id, undefined, ref)

      const expected = original.refs[received.refs.length]
      if (ref.plugin !== expected.plugin) throw new ReferenceMismatch(id, expected, ref)

      const plugin = getPlugin(expected.plugin)
      if (!plugin) throw new PluginNotFound(expected.plugin)

      received.refs.push(ref)
    },
    receive(plugin: PluginInstance, action: SpecAction) {
      if (ended) throw new ActionMismatch(id, undefined, { type: action.type, plugin: plugin.name })

      received.actions.push(action)
      // const expected = this.original.actions[0]

      // throw new ActionMismatch(this.id, expected, action)
    },
    end() {
      ended = true
      if (original.actions.length > received.actions.length) {
        const expectedAction = original.actions[received.actions.length]
        const plugin = findPluginNameInOriginal(expectedAction.ref)
        throw new ActionMismatch(id, { type: expectedAction.type, plugin }, undefined)
      }
    }
  }

  function findPluginNameInOriginal(ref: string | number) {
    while (typeof ref === 'number') {
      ref = original.actions[ref].ref
    }
    return original.refs[Number(ref)].plugin
  }
}
