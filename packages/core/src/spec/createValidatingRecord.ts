import { Omit } from 'type-plus';
import { getPlugin, PluginNotFound } from '../plugin';
import { ActionMismatch, ReferenceMismatch } from './errors';
import { getRefId } from './SpecRecord';
import { SpecAction, SpecRecord, SpecOptions } from './types';
import { SpecRecordLive, SpecReferenceLive } from './typesInternal';
import { createTimeTracker } from '../util';

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
  return {
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
    addAction(plugin: string, action: Omit<SpecAction, 'tick'>) {
      if (ended) throw new ActionMismatch(specId, undefined, { type: action.type, plugin })

      return received.actions.push({ ...action, tick: time.elaspe() })
      // const expected = this.original.actions[0]

      // throw new ActionMismatch(this.id, expected, action)
    },
    peekAction() {
      return original.actions[received.actions.length]
    },
    end() {
      ended = true
      time.stop()
      if (original.actions.length > received.actions.length) {
        const expectedAction = original.actions[received.actions.length]
        const plugin = findPluginNameInOriginal(expectedAction.ref)
        throw new ActionMismatch(specId, { type: expectedAction.type, plugin }, undefined)
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
