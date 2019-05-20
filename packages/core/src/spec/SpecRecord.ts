import { getPlugin } from '../plugin';
import { SimulationMismatch } from './errors';
import { isMismatchAction } from './isMismatchAction';
import { InvokeAction, ReturnAction, SpecAction, SpecRecord, ThrowAction } from './types';

export type SpecRecordTracker = ReturnType<typeof createSpecRecordTracker>

export function createSpecRecordTracker(record: SpecRecord) {
  return {
    getReference(plugin: string, target: any) {
      const ref = this.findReference(target) || String(record.refs.length + 1)
      record.refs.push({ ref, plugin, target })
      return ref

    },
    findReference(target: any) {
      const specRef = record.refs.find(ref => ref.target === target)
      if (specRef) return specRef.ref
      return undefined
    },
    invoke(ref: string, args: any[]) {
      record.actions.push({
        type: 'invoke',
        ref,
        payload: args.map(arg => this.findReference(arg) || arg)
      })
    },
    return(ref: string, result: any) {
      const payload = this.findReference(result) || result
      record.actions.push({
        type: 'return',
        ref,
        payload
      })
    },
    throw(ref: string, err: any) {
      const payload = this.findReference(err) || err
      record.actions.push({
        type: 'throw',
        ref,
        payload
      })
    },

    addAction(action: SpecAction) {
      record.actions.push(action)
    }
  }
}

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

export function createSpecRecordValidator(id: string, loaded: SpecRecord, record: SpecRecord) {
  return {
    getReference(plugin: string, target: any) {
      const ref = this.findReference(target) || String(record.refs.length + 1)
      record.refs.push({ ref, plugin, target })
      return ref

    },
    findReference(target: any) {
      const specRef = record.refs.find(ref => ref.target === target)
      if (specRef) return specRef.ref
      return undefined
    },
    resolveTarget(ref: string) {
      let specRef = record.refs.find(r => r.ref === ref)
      if (specRef) return specRef.target

      specRef = loaded.refs.find(r => r.ref === ref)
      if (specRef) {
        const plugin = getPlugin(specRef.plugin)
        if (plugin && plugin.deserialize) {
          return plugin.deserialize(specRef.target)
        }
        else {
          return specRef.target
        }
      }

      return undefined
    },
    invoke(ref: string, args: any[]) {
      const action: InvokeAction = {
        type: 'invoke',
        ref,
        payload: args.map(arg => this.findReference(arg) || arg)
      }
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    return(ref: string, result: any) {
      const payload = this.findReference(result) || result
      const action: ReturnAction = {
        type: 'return',
        ref,
        payload
      }
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    throw(ref: string, err: any) {
      const payload = this.findReference(err) || err
      const action: ThrowAction = {
        type: 'throw',
        ref,
        payload
      }
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    addAction(action: SpecAction) {
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    succeed() {
      const next = loaded.actions[record.actions.length]
      return next.type === 'return'
    },
    result() {
      const next = loaded.actions[record.actions.length]
      return this.resolveTarget(next.payload) || next.payload
    }
  }
}

function validateAction(id: string, actualRecord: SpecRecord, record: SpecRecord, action: SpecAction) {
  const expected = actualRecord.actions[record.actions.length]
  if (isMismatchAction(action, expected)) {
    throw new SimulationMismatch(id, expected, action)
  }
}
