import { tersify } from 'tersify';
import { log } from '../common';
import { getPlugin } from '../plugin';
import { SimulationMismatch } from './errors';
import { isMismatchAction } from './isMismatchAction';
import { ConstructAction, GetAction, InvokeAction, SetAction, SpecAction, SpecRecord, InvokeReturnAction, InvokeThrowAction, SetReturnAction, SetThrowAction, GetThrowAction, GetReturnAction } from './types';

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
    construct(ref: string, args: any[]) {
      record.actions.push({
        type: 'construct',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      })
    },
    invoke(ref: string, args: any[]) {
      record.actions.push({
        type: 'invoke',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      })
    },
    invokeReturn(ref: string, result: any) {
      const payload = this.findId(result) || result
      record.actions.push({
        type: 'invoke-return',
        id: ref,
        payload
      })
    },
    invokeThrow(ref: string, err: any) {
      const payload = this.findId(err) || err
      record.actions.push({
        type: 'invoke-throw',
        id: ref,
        payload
      })
    },
    get(ref: string, prop: string | number) {
      record.actions.push({
        type: 'get',
        id: ref,
        payload: prop
      })
    },
    getReturn(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'get-return',
        id: ref,
        payload: [prop, value]
      })
    },
    getThrow(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'get-throw',
        id: ref,
        payload: [prop, value]
      })
    },
    set(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'set',
        id: ref,
        payload: [prop, value]
      })
    },
    setReturn(ref: string, prop: string | number, input: any, value: any) {
      record.actions.push({
        type: 'set-return',
        id: ref,
        payload: [prop, input, value]
      })
    },
    setThrow(ref: string, prop: string | number, input: any, value: any) {
      record.actions.push({
        type: 'set-throw',
        id: ref,
        payload: [prop, input, value]
      })
    }
  }
}

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

export function createSpecRecordValidator(id: string, loaded: SpecRecord, record: SpecRecord) {
  // not using specific type as the type is platform specific (i.e. NodeJS.Immediate)
  const scheduled: any[] = []
  function addAction(action: SpecAction) {
    validateAction(id, loaded, record, action)
    record.actions.push(action)
  }

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
    construct(ref: string, args: any[]) {
      const action: ConstructAction = {
        type: 'construct',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      }
      addAction(action)
    },
    invoke(ref: string, args: any[]) {
      const action: InvokeAction = {
        type: 'invoke',
        id: ref,
        payload: args.map(arg => this.findId(arg) || arg)
      }
      addAction(action)
    },
    invokeReturn() {
      const action = this.peekNextAction() as InvokeReturnAction
      const result = this.getTarget(action.payload) || action.payload
      addAction(action)
      return result
    },
    invokeThrow() {
      const action = this.peekNextAction() as InvokeThrowAction
      const err = this.getTarget(action.payload) || action.payload
      addAction(action)
      return err
    },
    get(ref: string, prop: string | number) {
      const action: GetAction = {
        type: 'get',
        id: ref,
        payload: prop
      }
      addAction(action)
    },
    getReturn(ref: string, prop: string | number, value: any) {
      const action: GetReturnAction = {
        type: 'get-return',
        id: ref,
        payload: [prop, value]
      }
      addAction(action)
    },
    getThrow(ref: string, prop: string | number, value: any) {
      const action: GetThrowAction = {
        type: 'get-throw',
        id: ref,
        payload: [prop, value]
      }
      addAction(action)
    },
    set(ref: string, prop: string | number, value: any) {
      const action: SetAction = {
        type: 'set',
        id: ref,
        payload: [prop, value]
      }
      addAction(action)
    },
    setReturn(ref: string, prop: string | number, input: any, value: any) {
      const action: SetReturnAction = {
        type: 'set-return',
        id: ref,
        payload: [prop, input, value]
      }
      addAction(action)
    },
    setThrow(ref: string, prop: string | number, input: any, value: any) {
      const action: SetThrowAction = {
        type: 'set-throw',
        id: ref,
        payload: [prop, input, value]
      }
      addAction(action)
    },
    succeed() {
      const next = this.peekNextAction()!
      return next.type === 'invoke-return'
    },
    processNextActions() {
      const next = this.peekNextAction()
      log.warn(`next action:`, next)
      if (!next || this.isSubject(next.id)) return

      const ref = this.getRef(next.id)
      log.warn(`ref`, ref, record.refs)
      const plugin = getPlugin(ref.plugin)!
      const target = this.getTarget(next.id)

      // TOTHINK: where does the return value go to? All not used?
      // setup expectation for stub?
      switch (next.type) {
        case 'construct':
          const constructArgs = next.payload.map(x => typeof x === 'string' ? this.getTarget(x) : x)
          log.onDebug(() => `auto construct: "${this.findId(target)}" with ${tersify(constructArgs)}`)
          plugin.construct!(target, constructArgs)
          this.processNextActions()
          break;
        case 'invoke':
          const args = next.payload.map(x => typeof x === 'string' ? this.getTarget(x) : x)
          log.onDebug(() => `auto invoke: "${this.findId(target)}" with ${tersify(args)}`)
          target(...args)
          // plugin.invoke!(target, args)
          this.processNextActions()
          break;
        case 'get':
          // log.onDebug(() => `auto get: "${this.findId(target)}" for ${tersify(next.payload)}`)
          // tslint:disable-next-line: no-unused-expression
          target[next.payload]
          // plugin.get!(target, next.payload)
          this.processNextActions()
          break;
      }
    },
    scheduleProcessNextActions() {
      scheduled.push(setImmediate(() => this.processNextActions()))
    },
    stop() {

      scheduled.forEach(s => clearImmediate(s))
    }
  }
}

function validateAction(id: string, actualRecord: SpecRecord, record: SpecRecord, action: SpecAction) {
  const expected = actualRecord.actions[record.actions.length]
  if (isMismatchAction(action, expected)) {
    throw new SimulationMismatch(id, expected, action)
  }
}
