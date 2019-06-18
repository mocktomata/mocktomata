import { tersify } from 'tersify';
import { getPlugin } from '../plugin';
import { log } from '../util';
import { ActionMismatch } from './errors';
import { isMismatchAction } from './isMismatchAction';
import { GetAction, InstantiateAction, InvokeAction, ReturnAction, SetAction, SpecAction, SpecRecord, ThrowAction } from './types';
import { SpecRecordLive } from './typesInternal';

export type SpecRecordTracker = ReturnType<typeof createSpecRecordTracker>

export function createSpecRecordTracker(record: SpecRecordLive) {
  return {
    getId(plugin: string, subject: any, target: any, serialize = true) {
      const id = this.findId(target)
      if (!id) {
        record.refs.push(serialize ? { plugin, subject, target, serialize } : { plugin, subject, target })
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
        type: 'instantiate',
        ref,
        payload: args.map(arg => this.findId(arg) || arg)
      })
    },
    invoke(ref: string, args: any[]) {
      record.actions.push({
        type: 'invoke',
        ref,
        payload: args.map(arg => this.findId(arg) || arg)
      })
    },
    invokeReturn(ref: string, result: any) {
      const payload = this.findId(result) || result
      record.actions.push({
        type: 'return',
        ref: 0,
        payload
      })
    },
    invokeThrow(ref: string, err: any) {
      const payload = this.findId(err) || err
      record.actions.push({
        type: 'throw',
        ref: 0,
        payload
      })
    },
    get(ref: string, prop: string | number) {
      record.actions.push({
        type: 'get',
        ref,
        payload: prop
      })
    },
    getReturn(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'return',
        ref: 0,
        payload: [prop, value]
      })
    },
    getThrow(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'throw',
        ref: 0,
        payload: [prop, value]
      })
    },
    set(ref: string, prop: string | number, value: any) {
      record.actions.push({
        type: 'set',
        ref,
        payload: [prop, value]
      })
    },
    setReturn(ref: string, prop: string | number, input: any, value: any) {
      record.actions.push({
        type: 'return',
        ref: 0,
        payload: [prop, input, value]
      })
    },
    setThrow(ref: string, prop: string | number, input: any, value: any) {
      record.actions.push({
        type: 'throw',
        ref: 0,
        payload: [prop, input, value]
      })
    }
  }
}

export type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>

export function createSpecRecordValidator(id: string, loaded: SpecRecord, record: SpecRecordLive) {
  // not using specific type as the type is platform specific (i.e. NodeJS.Immediate)
  const scheduled: any[] = []
  function addAction(action: SpecAction) {
    validateAction(id, loaded, record, action)
    record.actions.push(action)
  }

  return {
    loaded,
    record,
    getId(plugin: string, subject: any, target: any) {
      const ref = this.findId(target)
      if (!ref) {
        record.refs.push({ plugin, subject, target })
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
    isSerialized(ref: any) {
      const index = Number(ref)
      return !!loaded.refs[index].serialize
    },
    getSubject(ref: string) {
      const index = Number(ref)
      let specRef = record.refs[index]
      if (specRef) return specRef.target

      specRef = loaded.refs[index]
      if (specRef) {
        if (specRef.serialize) {
          const plugin = getPlugin(specRef.plugin)!
          if (plugin.deserialize) {
            // const subject = plugin.deserialize(specRef.subject)
            // plugin.createStub(recordValidator, subject)
            return plugin.deserialize(specRef.subject)
          }
        }

        return specRef.subject
      }

      return undefined
    },
    peekNextAction(): SpecAction | undefined {
      return loaded.actions[record.actions.length]
    },
    construct(ref: string, args: any[]) {
      const action: InstantiateAction = {
        type: 'instantiate',
        ref,
        payload: args.map(arg => this.findId(arg) || arg)
      }
      addAction(action)
    },
    invoke(ref: string, args: any[]) {
      const action: InvokeAction = {
        type: 'invoke',
        ref,
        payload: args.map(arg => this.findId(arg) || arg)
      }
      addAction(action)
    },
    invokeReturn() {
      const action = this.peekNextAction() as ReturnAction
      const result = this.getSubject(action.payload) || action.payload
      addAction(action)
      return result
    },
    invokeThrow() {
      const action = this.peekNextAction() as ThrowAction
      const err = this.getSubject(action.payload) || action.payload
      addAction(action)
      return err
    },
    get(ref: string, prop: string | number) {
      const action: GetAction = {
        type: 'get',
        ref,
        payload: prop
      }
      addAction(action)
    },
    getReturn(ref: string, prop: string | number, value: any) {
      const action: ReturnAction = {
        type: 'return',
        ref: 0,
        payload: [prop, value]
      }
      addAction(action)
    },
    getThrow(ref: string, prop: string | number, value: any) {
      const action: ThrowAction = {
        type: 'throw',
        ref: 0,
        payload: [prop, value]
      }
      addAction(action)
    },
    set(ref: string, prop: string | number, value: any) {
      const action: SetAction = {
        type: 'set',
        ref,
        payload: [prop, value]
      }
      addAction(action)
    },
    setReturn(ref: string, prop: string | number, input: any, value: any) {
      const action: ReturnAction = {
        type: 'return',
        ref: 0,
        payload: [prop, input, value]
      }
      addAction(action)
    },
    setThrow(ref: string, prop: string | number, input: any, value: any) {
      const action: ThrowAction = {
        type: 'throw',
        ref: 0,
        payload: [prop, input, value]
      }
      addAction(action)
    },
    succeed() {
      const next = this.peekNextAction()!
      return next.type === 'return'
    },
    processNextActions() {
      const next = this.peekNextAction()
      log.warn(`next action:`, next)
      if (!next || !this.isSerialized(next.ref)) return

      const ref = this.getRef(next.ref as any)
      log.warn(`ref`, ref, record.refs)
      // const plugin = getPlugin(ref.plugin)!
      const target = this.getSubject(next.ref as any)

      // TOTHINK: where does the return value go to? All not used?
      // setup expectation for stub?
      switch (next.type) {
        case 'instantiate':
          const constructArgs = next.payload.map(x => typeof x === 'string' ? this.getSubject(x) : x)
          log.onDebug(() => `auto construct: "${this.findId(target)}" with ${tersify(constructArgs)}`)
          // TODO: get SpyRecorder of the `target` and call `.on('construct', cb) to get the instance?
          // plugin.construct!(target, constructArgs)

          this.processNextActions()
          break;
        case 'invoke':
          const args = next.payload.map(x => typeof x === 'string' ? this.getSubject(x) : x)
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

function validateAction(id: string, loaded: SpecRecord, record: SpecRecord, action: SpecAction) {
  const loadedAction = loaded.actions[record.actions.length]
  if (isMismatchAction(action, loadedAction)) {
    const expected = {
      type: loadedAction.type,
      plugin: loaded.refs[Number(loadedAction.ref)].plugin
    }
    const actual = {
      type: action.type,
      plugin: record.refs[Number(action.ref)].plugin
    }
    throw new ActionMismatch(id, expected, actual)
  }
}
