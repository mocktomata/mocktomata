import { SpecAction, SimulationMismatch, SpecCallbackAction, StubContext } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

import { NotSpecable } from './errors'
import { log } from './log'
import { plugins } from './plugin'

export class ActionTracker {
  callbacks: { action: SpecAction, callback: Function }[] = []
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  actualActions: SpecAction[] = []
  stubs: { action: SpecCallbackAction, stub, subject }[] = []
  constructor(public specId: string, public actions: SpecAction[]) { }
  received(actual) {
    const expected = this.peek()
    if (SimulationMismatch.mismatch(actual, expected)) {
      throw new SimulationMismatch(this.specId, expected, actual)
    }
    log.onDebug(() => `received: ${tersifyAction(actual)}`)

    this.push(actual)
    this.process(actual)
  }
  succeed(meta?) {
    const expected = this.peek()
    return expected && expected.name === 'return' && createSatisfier(meta).test(expected.meta)
  }
  result() {
    const expected = this.peek()
    this.push(expected)

    log.onDebug(() => `result: ${tersifyAction(expected)}`)

    const result = this.getResultOf(expected)
    setImmediate(() => this.process())
    if (result && result.prototype === 'Error') {
      const err = new Error(result.message)
      Object.keys(result)
        .filter(p => p !== 'prototype' && p !== 'message')
        .forEach(p => err[p] = result[p])
      return err
    }
    return result
  }
  blockUntil(action) {
    log.onDebug(() => `blockUntil: ${tersify(action, { maxLength: Infinity })}`)

    let expected = this.peek()
    while (expected && SimulationMismatch.mismatch(expected, action)) {
      this.process()
      const next = this.peek()
      if (next === expected) {
        // infinite loop
        // istanbul ignore next
        log.error(`blockUntil: can't move forward with ${tersifyAction(next)}`)
        break
      }
      expected = next
    }
  }
  waitUntil(action, callback) {
    log.onDebug(() => `waitUntil: ${tersifyAction(action)}`)
    this.callbacks.push({ action, callback })
  }
  on(actionType: string, name: string, callback) {
    if (!this.events[actionType])
      this.events[actionType] = {}
    if (!this.events[actionType][name])
      this.events[actionType][name] = []
    this.events[actionType][name].push(callback)
  }
  onAny(callback: (action: SpecAction) => void) {
    this.listenAll.push(callback)
    const action = this.peek()
    if (action) {
      callback(action)
    }
  }
  private getResultOf(returnAction: SpecAction) {
    if (!returnAction.returnType) return returnAction.payload

    let nextAction = this.peek()
    if (!nextAction) throw new SimulationMismatch(this.specId, {
      type: returnAction.returnType,
      instanceId: returnAction.returnInstanceId
    })

    return this.getStub(nextAction)
  }
  private getStub(action: SpecAction, subject?) {
    const plugin = plugins.find(p => p.type === action.type)
    if (!plugin) throw new NotSpecable(action.type)
    return plugin.getStub(createStubContext(this, plugin.type), subject)
  }
  private process(invokeAction?: SpecAction) {
    let expected = this.peek()

    if (!expected) {
      if (invokeAction && invokeAction.name !== 'construct') {
        throw new SimulationMismatch(this.specId,
          {
            type: invokeAction.type,
            name: 'return',
            instanceId: invokeAction.instanceId,
            invokeId: invokeAction.invokeId
          })
      }
      else {
        return
      }
    }

    log.onDebug(() => `processing: ${tersifyAction(expected)}`)

    if (this.callbacks.length > 0) {
      const cb = this.callbacks.filter(c => !SimulationMismatch.mismatch(expected, c.action))
      cb.forEach(c => {
        this.callbacks.splice(this.callbacks.indexOf(c), 1)
        c.callback(expected)
      })
    }

    if (hasSource(expected)) {
      if (expected.name === 'construct') {
        const subject = this.getSourceSubject(expected)
        // the stub will consume the `construct` action
        const stub = this.getSourceStub(expected, subject)
        this.stubs.push({ action: expected, stub, subject })
        this.process()
      }
    }
    if (invokeAction && isReturnAction(invokeAction, expected)) return

    if (expected.name === 'invoke') {
      const entry = this.stubs.find(e =>
        e.action.type === expected.type &&
        e.action.instanceId === expected.instanceId
      )
      if (entry) {
        entry.stub(...expected.payload)
        // console.log(entry.subject, expected)
        // entry.subject(...expected.payload)
      }
    }
  }
  private peek() {
    return this.actions[this.actualActions.length]
  }
  private push(action) {
    this.actualActions.push(action)
    this.callListeners(action)
  }
  private callListeners(action) {
    if (this.events[action.type]) {
      if (this.events[action.type][action.name])
        this.events[action.type][action.name].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
  private getSourceSubject({ sourceType, sourceInstanceId, sourceInvokeId, sourcePath }: SpecCallbackAction) {
    const source = this.actualActions.find(a => a.type === sourceType && a.instanceId === sourceInstanceId && a.invokeId === sourceInvokeId)
    if (source) {
      return sourcePath.reduce((p, v) => {
        return p[v]
      }, source.payload)
    }
  }
  private getSourceStub(action: SpecCallbackAction, subject?) {
    const plugin = plugins.find(p => p.type === action.type)
    if (!plugin) throw new NotSpecable(action.type)
    return plugin.getStub(createSourceStubContext(this, action, subject), subject)
  }
}

function isReturnAction(action, nextAction) {
  // may need to compare meta too.
  return action.type === nextAction.type &&
    nextAction.name === 'return' &&
    action.instanceId === nextAction.instanceId &&
    action.invokeId === nextAction.invokeId
}
function hasSource(action): action is SpecCallbackAction {
  return !!action.sourceType
}

export function createStubContext(actionTracker: ActionTracker, pluginType: string) {
  return {
    specId: actionTracker.specId,
    newInstance(args, meta) {
      return createStubInstance(actionTracker, pluginType, args, meta)
    }
  } as StubContext
}

function createStubInstance(actionTracker, type, args, meta) {
  const instanceId = actionTracker.actualActions.filter(a => a.type === type && a.name === 'construct').length + 1
  let invokeId = 0
  actionTracker.received({
    type,
    name: 'construct',
    payload: args,
    meta,
    instanceId
  })
  return {
    instanceId,
    newCall(callMeta?: { [k: string]: any }) {
      return createStubCall(actionTracker, type, instanceId, ++invokeId, callMeta)
    }
  }
}

function createStubCall(actionTracker: ActionTracker, type, instanceId, invokeId, callMeta) {
  return {
    invokeId,
    invoked(args: any[], meta?: { [k: string]: any }) {
      actionTracker.received({
        type,
        name: 'invoke',
        payload: args,
        meta: callMeta ? unpartial(callMeta, meta) : meta,
        instanceId,
        invokeId
      })
    },
    waitUntilReturn(callback) {
      const expected = {
        type,
        name: 'return',
        payload: undefined,
        instanceId,
        invokeId
      }
      actionTracker.waitUntil(expected, callback)
    },
    blockUntilReturn() {
      actionTracker.blockUntil({
        type,
        instanceId,
        invokeId
      })
    },
    succeed(meta?: { [k: string]: any }) {
      return actionTracker.succeed(meta)
    },
    result() {
      return actionTracker.result()
    },
    thrown() {
      return actionTracker.result()
    }
  }
}

function tersifyAction(action) {
  return tersify(Object.keys(action).reduce((p, k) => {
    if (k === 'payload') {
      p[k] = tersify(action[k])
    }
    else {
      p[k] = action[k]
    }
    return p
  }, {}), { maxLength: Infinity })
}

function createSourceStubContext(actionTracker: ActionTracker, action: SpecCallbackAction, subject) {
  return {
    specId: actionTracker.specId,
    newInstance(args, meta) {
      return createSourceStubInstance(actionTracker, action, subject, args, meta)
    }
  } as StubContext
}

function createSourceStubInstance(actionTracker, action: SpecCallbackAction, subject, args, meta) {
  const instanceId = actionTracker.actualActions.filter(a => a.type === action.type && a.name === 'construct').length + 1
  let invokeId = 0
  actionTracker.received({
    type: action.type,
    name: 'construct',
    payload: args,
    meta,
    instanceId,
    sourceType: action.sourceType,
    sourceInstanceId: action.sourceInstanceId,
    sourceInvokeId: action.sourceInvokeId,
    sourcePath: action.sourcePath
  })
  return {
    instanceId,
    newCall(callMeta?: { [k: string]: any }) {
      return createSourceStubCall(actionTracker, action.type, subject, instanceId, ++invokeId, callMeta)
    }
  }
}

function createSourceStubCall(actionTracker: ActionTracker, type, subject, instanceId, invokeId, callMeta) {
  return {
    invokeId,
    invoked(args: any[], meta?: { [k: string]: any }) {
      actionTracker.received({
        type,
        name: 'invoke',
        payload: args,
        meta: callMeta ? unpartial(callMeta, meta) : meta,
        instanceId,
        invokeId
      })
      subject(...args)
    },
    waitUntilReturn(callback) {
      const expected = {
        type,
        name: 'return',
        payload: undefined,
        instanceId,
        invokeId
      }
      actionTracker.waitUntil(expected, callback)
    },
    blockUntilReturn() {
      actionTracker.blockUntil({
        type,
        instanceId,
        invokeId
      })
    },
    succeed(meta?: { [k: string]: any }) {
      return actionTracker.succeed(meta)
    },
    result() {
      return actionTracker.result()
    },
    thrown() {
      return actionTracker.result()
    }
  }
}
