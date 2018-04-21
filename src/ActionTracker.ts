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
    // console.log('resultof', returnAction)
    if (!returnAction.returnType) return returnAction.payload

    let nextAction = this.peek()
    if (!nextAction) throw new SimulationMismatch(this.specId, {
      type: returnAction.returnType,
      instanceId: returnAction.returnInstanceId
    })

    return this.getStub(nextAction)
  }
  private getStub(action: SpecAction) {
    const plugin = plugins.find(p => p.type === action.type)
    if (!plugin) throw new NotSpecable(action.type)
    return plugin.getStub(createStubContext(this, plugin.type), undefined)
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

    log.onDebug(() => `process: ${tersifyAction(expected)}`)

    if (this.callbacks.length > 0) {
      const cb = this.callbacks.filter(c => !SimulationMismatch.mismatch(expected, c.action))
      cb.forEach(c => {
        this.callbacks.splice(this.callbacks.indexOf(c), 1)
        c.callback(expected)
      })
    }

    if (invokeAction && isReturnAction(invokeAction, expected)) return

    if (isCallbackAction(expected)) {
      const callback = this.getCallback(expected)
      this.push(expected)
      callback(...expected.payload)

      this.process()
    }
  }
  peek() {
    return this.actions[this.actualActions.length]
  }
  private push(action) {
    this.actualActions.push(action)
    this.callListeners(action)
  }
  private getCallback({ sourceType, sourceInstanceId, sourceInvokeId, sourcePath }: SpecCallbackAction) {
    const source = this.actualActions.find(a => a.type === sourceType && a.instanceId === sourceInstanceId && a.invokeId === sourceInvokeId)
    if (source) {
      return sourcePath.reduce((p, v) => {
        return p[v]
      }, source.payload)
    }
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
}

function isReturnAction(action, nextAction) {
  // may need to compare meta too.
  return action.type === nextAction.type &&
    nextAction.name === 'return' &&
    action.instanceId === nextAction.instanceId &&
    action.invokeId === nextAction.invokeId
}
function isCallbackAction(action): action is SpecCallbackAction {
  return action.type === 'callback' && action.name === 'invoke'
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
        name: 'return',
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
