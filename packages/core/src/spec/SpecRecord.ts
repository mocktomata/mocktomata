import { getPlugin } from '../plugin';
import { SimulationMismatch } from './errors';
import { isMismatchAction } from './isMismatchAction';
import { InvokeAction, SpecAction, SpecRecord } from './types';

export type SpecRecordTracker = ReturnType<typeof createSpecRecordTracker>

export function createSpecRecordTracker(record: SpecRecord) {
  return {
    getId(plugin: string, target: any, isSubject?: true) {
      const id = this.findId(target)
      if (!id) {
        record.refs.push(isSubject ? { plugin, target, isSubject } : { plugin, target })
        return String(record.refs.length - 1)
      }

      return id
    },
    findId(target: any) {
      const id = record.refs.findIndex(ref => ref.target === target)
      if (id !== -1) return String(id)
      return undefined
    },
    invoke(ref: string, args: any[]) {
      record.actions.push({
        type: 'invoke',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      })
    },
    return(ref: string, result: any) {
      const payload = this.findId(result) || result
      record.actions.push({
        type: 'return',
        id: ref,
        payload
      })
    },
    throw(ref: string, err: any) {
      const payload = this.findId(err) || err
      record.actions.push({
        type: 'throw',
        id: ref,
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
    loaded,
    record,
    getId(plugin: string, target: any) {
      const ref = this.findId(target)
      if (!ref) {
        record.refs.push({ plugin, target })
        return String(record.refs.length - 1)
      }

      return ref
    },
    findId(target: any) {
      const ref = record.refs.findIndex(ref => ref.target === target)
      if (ref !== -1) return String(ref)
      return undefined
    },
    getRef(id: string) {
      return record.refs[Number(id)]
    },
    isSubject(ref: string) {
      const index = Number(ref)
      return !!loaded.refs[index].isSubject
    },
    getTarget(ref: string) {
      const index = Number(ref)
      let specRef = record.refs[index]
      if (specRef) return specRef.target

      specRef = loaded.refs[index]
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
    peekNextAction(): SpecAction | undefined {
      return loaded.actions[record.actions.length]
    },
    invoke(ref: string, args: any[]) {
      const action: InvokeAction = {
        type: 'invoke',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      }
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    return() {
      const next = this.peekNextAction()!
      const result = this.getTarget(next.payload) || next.payload
      validateAction(id, loaded, record, next)
      record.actions.push(next)
      return result
    },
    throw() {
      const next = this.peekNextAction()!
      const err = this.getTarget(next.payload) || next.payload
      validateAction(id, loaded, record, next)
      record.actions.push(next)
      return err
    },
    addAction(action: SpecAction) {
      validateAction(id, loaded, record, action)
      record.actions.push(action)
    },
    succeed() {
      const next = this.peekNextAction()!
      return next.type === 'return'
    }
  }
}

function validateAction(id: string, actualRecord: SpecRecord, record: SpecRecord, action: SpecAction) {
  const expected = actualRecord.actions[record.actions.length]
  if (isMismatchAction(action, expected)) {
    throw new SimulationMismatch(id, expected, action)
  }
}
