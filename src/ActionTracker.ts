import { SpecAction, SimulationMismatch, SpecActionWithSource, StubContext } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

import { artifactKey } from './constants'
import { NotSpecable, SourceNotFound } from './errors'
import { log } from './log'
import { plugins } from './plugin'

export class ActionTracker {
  waitings: { action: SpecAction, callback: Function }[] = []
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  actualActions: SpecAction[] = []
  stubs: { action: SpecActionWithSource, stub, subject }[] = []
  constructor(public specId: string, public actions: SpecAction[]) { }
  received(actual) {
    const expected = this.peek()

    if (actual.payload) {
      // set expected payload to undefined for artifact,
      // so that it is ignored during mismatch check
      actual.payload.forEach((v, i) => {
        if (v !== undefined && v !== null && v[artifactKey] && expected.payload[i])
          expected.payload[i] = undefined
      })
    }
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
  blockUntil(_action) {
    // TODO: Post 6.0 remove blockUntil?
    // Seems like I don't need this.
    // Will remove in 6.1 if real world usage proves this.
    // log.onDebug(() => `blockUntil: ${tersify(action, { maxLength: Infinity })}`)

    // let expected = this.peek()
    // while (expected && SimulationMismatch.mismatch(expected, action)) {
    //   this.process()
    //   const next = this.peek()
    //   if (next === expected) {
    //     // infinite loop
    //     // istanbul ignore next
    //     log.error(`blockUntil: can't move forward with ${tersifyAction(next)}`)
    //     break
    //   }
    //   expected = next
    // }
  }
  waitUntil(action, callback) {
    log.onDebug(() => `waitUntil: ${tersifyAction(action)}`)
    this.waitings.push({ action, callback })
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
    callback(action)
  }
  private getResultOf(returnAction: SpecAction) {
    if (!returnAction.returnType) return returnAction.payload

    let nextAction = this.peek()
    // istanbul ignore next
    if (!nextAction) throw new SimulationMismatch(this.specId, {
      type: returnAction.returnType,
      instanceId: returnAction.returnInstanceId
    })

    return this.getStub(nextAction)
  }
  private getStub(action: SpecAction, subject?) {
    const plugin = plugins.find(p => p.type === action.type)
    // istanbul ignore next
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

    if (this.waitings.length > 0) {
      const cb = this.waitings.filter(c => !SimulationMismatch.mismatch(expected, c.action))
      cb.forEach(c => {
        this.waitings.splice(this.waitings.indexOf(c), 1)
        c.callback(expected)
      })
    }

    if (invokeAction && isReturnAction(invokeAction, expected)) {
      log.debug('wait for return action')
      return
    }

    if (isActionWithSource(expected)) {
      log.onDebug(() => `create stub: ${tersifyAction(expected)}`)
      const subject = this.getSourceSubject(expected)
      // the stub will consume the `construct` action
      const stub = this.getSourceStub(expected, subject)
      this.stubs.push({ action: expected, stub, subject })
      this.process()
    }

    if (expected.name === 'invoke') {
      const entry = this.stubs.find(e =>
        e.action.type === expected.type &&
        e.action.instanceId === expected.instanceId
      )
      if (entry) {
        log.onDebug(() => `auto invoke: ${tersifyAction(expected)}`)
        invokeSubjectAtSite(entry.stub, expected.meta, expected.payload)
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
  private getSourceSubject(action: SpecActionWithSource) {
    const { sourceType, sourceInstanceId, sourceInvokeId, sourcePath } = action
    const source = this.actualActions.find(a => a.type === sourceType && a.instanceId === sourceInstanceId && a.invokeId === sourceInvokeId)

    // istanbul ignore next
    if (!source) throw new SourceNotFound(action)

    return sourcePath.reduce((p, v) => {
      return p[v]
    }, source.payload)
  }
  private getSourceStub(action: SpecActionWithSource, subject?) {
    const plugin = plugins.find(p => p.type === action.type)
    // istanbul ignore next
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

function isActionWithSource(action): action is SpecActionWithSource {
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

// istanbul ignore next
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

function createSourceStubContext(actionTracker: ActionTracker, action: SpecActionWithSource, subject) {
  return {
    specId: actionTracker.specId,
    newInstance(args, meta) {
      return createSourceStubInstance(actionTracker, action, subject, args, meta)
    }
  } as StubContext
}

function createSourceStubInstance(actionTracker, action: SpecActionWithSource, subject, args, meta) {
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
  const stubCall = createStubCall(actionTracker, type, instanceId, invokeId, callMeta)
  const invoked = stubCall.invoked
  stubCall.invoked = (args: any[], meta?: { [k: string]: any }) => {
    const mergedMeta = callMeta ? unpartial(callMeta, meta) : meta
    invoked(args, meta)
    invokeSubjectAtSite(subject, mergedMeta, args)
  }
  return stubCall
}

// Ignore this at the moment because it needs to serialize/deserialize function in the action.payload (args).
// istanbul ignore next
function invokeSubjectAtSite(subject, meta, args) {
  if (!meta || !meta.site) {
    subject(...args)
    return
  }

  let parent = subject
  const fn = meta.site.reduce((p, v) => {
    parent = p
    return p[v]
  }, subject)
  fn.call(parent, ...args)
}
