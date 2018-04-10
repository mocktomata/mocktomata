import { SpecAction, SimulationMismatch, SpecCallbackAction, StubContext } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'
import { tersify } from 'tersify'

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
    log.onDebug(() => `received: ${tersify(actual)}`)

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

    log.onDebug(() => `result: ${tersify(expected)}`)

    const result = this.getResultOf(expected)
    this.process()
    setImmediate(() => this.process())
    return result
  }
  blockUntil(action) {
    log.onDebug(() => `blockUntil: ${tersify(action)}`)

    let expected = this.peek()
    while (expected && SimulationMismatch.mismatch(expected, action)) {
      this.process()
      const next = this.peek()
      if (next === expected) {
        // infinite loop
        // istanbul ignore next
        log.error(`blockUntil: can't move forward with ${tersify(next, { maxLength: Infinity })}`)
        break
      }
      expected = next
    }
  }
  waitUntil(action, callback) {
    log.onDebug(() => `waitUntil: ${tersify(action)}`)
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
    while (nextAction && !isResultOf(returnAction, nextAction)) {
      this.process()
      nextAction = this.peek()
    }

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
      if (invokeAction) {
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

    log.onDebug(() => `process: ${tersify(expected)}`)

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
function isResultOf(returnAction: SpecAction, nextAction: SpecAction) {
  return returnAction.returnType === nextAction.type &&
    returnAction.returnInstanceId === nextAction.instanceId
  // and invokeId
}
function isReturnAction(action, nextAction) {
  // may need to compare meta too.
  return action.type === nextAction.type &&
    nextAction.name === 'return' &&
    action.instanceId === nextAction.instanceId &&
    action.invokeId === nextAction.invokeId
}
function isCallbackAction(action): action is SpecCallbackAction {
  return action.type === 'komondor' && action.name === 'callback'
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
    newCall() {
      return createStubCall(actionTracker, type, instanceId, ++invokeId)
    }
  }
}

function createStubCall(actionTracker: ActionTracker, type, instanceId, invokeId) {
  return {
    invokeId,
    invoked(args: any[], meta?: { [k: string]: any }) {
      actionTracker.received({
        type,
        name: 'invoke',
        payload: args,
        meta,
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
    onAny(callback) {
      actionTracker.onAny(callback)
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
