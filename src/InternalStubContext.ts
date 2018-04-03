import { StubContext, SpecAction, Plugin, StubCall, SimulationMismatch } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'
import { tersify } from 'tersify'

import { MissingReturnRecord } from './errors'
import { log } from './log';
import { plugins } from './plugin'

export class ActionTracker {
  currentIndex = 0
  constructor(public actions: SpecAction[]) { }
  peek() {
    return this.actions[this.currentIndex]
  }
  next() {
    this.currentIndex++
  }
}

class CallPlayer implements StubCall {
  wait(_meta?: { [k: string]: any; } | undefined): Promise<SpecAction> {
    throw new Error('Method not implemented.');
  }
  waitSync(): void {
    throw new Error('Method not implemented.');
  }
  args: any[]
  constructor(public context: InternalStubContext, public invokeId: number) { }
  invoked<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    const name = 'invoke'
    this.args = args

    const action = this.context.peek()
    log.onDebug(() => `invoked (${this.context.plugin.type}, ${this.context.instanceId}, ${this.invokeId}) with ${tersify(args)}, for ${tersify(action, { maxLength: Infinity })}`)

    this.ensureMatching(action, {
      type: this.context.plugin.type,
      name,
      payload: args,
      meta
    })

    this.context.callListeners(action)
    this.context.next()
    this.processUntilReturn()

    return args
  }
  // istanbul ignore next
  peek() {
    return this.context.peek()
  }
  // istanbul ignore next
  next() {
    return this.context.next()
  }
  succeed(meta?: { [k: string]: any }): boolean {
    const action = this.context.peek()
    return !!action &&
      action.type === this.context.plugin.type &&
      action.name === 'return' &&
      action.instanceId === this.context.instanceId &&
      (meta === undefined || createSatisfier(meta).test(action.meta))
  }
  result(): boolean {
    const action = this.context.peek()!
    this.context.callListeners(action)
    this.context.next()
    const { returnType, returnInstanceId } = action
    let nextAction = this.context.peek()

    let result
    if (returnType && returnInstanceId) {
      while (nextAction && isCallbackAction(nextAction)) {
        const sourceContext = this.getSourceContext(nextAction)!
        const sourceCall = this.getSourceCall(sourceContext, nextAction)
        const subject = locateCallback(nextAction, sourceCall.args)
        this.context.next()
        this.context.callListeners(nextAction)
        subject(...nextAction.payload)
        nextAction = this.context.peek()
      }

      if (nextAction && nextAction.type === returnType && nextAction.instanceId === returnInstanceId) {
        log.debug(`next action: ${tersify(nextAction)}`)
        const plugin = plugins.find(p => p.type === nextAction!.type)
        if (plugin) {
          const childContext = this.context.createChildContext(plugin)
          result = plugin.getStub(childContext, undefined)
        }
      }
      else {
        log.warn(`return result does not match with next action ${tersify(nextAction)}`)
      }
    }

    setImmediate(() => {
      let action = this.context.peek()
      while (action && isCallbackAction(action)) {
        const sourceContext = this.getSourceContext(action)!
        const sourceCall = this.getSourceCall(sourceContext, action)
        const subject = locateCallback(action, sourceCall.args)
        this.context.next()
        this.context.callListeners(action)
        subject(...action.payload)
        action = this.context.peek()
      }
    })
    return result !== undefined ? result : action.payload
  }
  thrown(): boolean {
    const action = this.context.peek()!
    this.context.callListeners(action)
    this.context.next()
    return action.payload
  }
  isReturnAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'return' &&
      action.instanceId === this.context.instanceId &&
      action.invokeId === this.invokeId
  }
  isThrowAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'throw' &&
      action.instanceId === this.context.instanceId &&
      action.invokeId === this.invokeId
  }
  getSourceCall(sourceContext: InternalStubContext, action: SpecAction) {
    return sourceContext.calls.find((c: CallPlayer) => c.invokeId === action.sourceInvokeId) as CallPlayer
  }
  processUntilReturn() {
    let action = this.context.peek()

    while (action && !this.isReturnAction(action) && !this.isThrowAction(action)) {
      log.onDebug(() => `processing ${tersify(action, { maxLength: Infinity })} by (${this.context.plugin.type}, ${this.context.instanceId}, ${this.invokeId})`)
      if (isCallbackAction(action)) {
        const subject = locateCallback(action, this.args)
        this.context.next()
        this.context.callListeners(action)
        subject(...action.payload)
      }
      else {
        log.onWarn(() => `skipping over: don't know how to handle ${tersify(action)}`)
        this.context.next()
      }

      action = this.context.peek()
    }

    if (!action) {
      throw new MissingReturnRecord()
    }

    log.onDebug(() => `processing exits with ${tersify(action)}`)
  }
  getSourceContext(action) {
    const entry = this.context.contexts.find(c =>
      c.type === action.sourceType &&
      c.instanceId === action.sourceInstanceId)

    return entry && entry.instance
  }
  argsMatch(actual, expected: any[]) {
    // istanbul ignore next
    if (expected.length !== actual.length)
      return false
    let match = true
    for (let i = 0; i < expected.length; i++) {
      const value = expected[i]
      const valueType = typeof value
      if (valueType === 'function') continue
      if (valueType === 'object' && value !== null) {
        // istanbul ignore next
        if (typeof actual !== 'object') {
          match = false
          break
        }

        const va = actual[i]
        match = !Object.keys(value).some(k => {
          if (typeof value[k] === 'function') return false
          return value[k] !== va[k]
        })
        if (!match)
          break;
      }
      // istanbul ignore next
      else if (expected[i] !== actual[i]) {
        match = false
        break;
      }
    }
    return match
  }
  ensureMatching(action, expected) {
    if (!action ||
      action.type !== expected.type ||
      action.name !== expected.name ||
      !this.argsMatch(action.payload, expected.payload) ||
      (expected.meta !== undefined && !createSatisfier(expected.meta).test(action.meta))
    ) {
      throw new SimulationMismatch(this.context.specId, expected, action)
    }
  }
}

export class InternalStubContext implements StubContext {
  actionTracker: ActionTracker
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  instanceId: number
  invokeCount = 0
  contexts: { type: string, instanceId: number, instance: InternalStubContext }[]
  calls: StubCall[] = []
  constructor(
    context,
    public specId: string,
    public plugin: Plugin<any>,
    public subject
  ) {
    this.actionTracker = context.actionTracker
    this.contexts = context.contexts
    this.instanceId = this.contexts.filter(c => c.type === plugin.type).length + 1
    this.contexts.push({ type: plugin.type, instanceId: this.instanceId, instance: this })
  }
  newCall(): StubCall {
    const call = new CallPlayer(this, ++this.invokeCount)
    this.calls.push(call)
    return call
  }
  next(): void {
    this.actionTracker.next()
  }
  peek(): SpecAction | undefined {
    return this.actionTracker.peek()
  }
  callListeners(action) {
    if (this.events[action.type]) {
      if (this.events[action.type][action.name])
        this.events[action.type][action.name].forEach(cb => cb(action))
    }
    if (this.listenAll.length > 0) {
      this.listenAll.forEach(cb => cb(action))
    }
  }
  createChildContext(plugin) {
    const childContext = new InternalStubContext(
      this,
      this.specId,
      plugin,
      undefined
    )
    return childContext
  }
  on(actionType: string, name: string, callback) {
    if (!this.events[actionType])
      this.events[actionType] = {}
    if (!this.events[actionType][name])
      this.events[actionType][name] = []
    this.events[actionType][name].push(callback)
  }
  onAny(callback) {
    this.listenAll.push(callback)
  }
}

function locateCallback(action, args) {
  if (!action.sourcePath) {
    return args.find(arg => typeof arg === 'function')
  }

  return action.sourcePath.reduce((p, v) => {
    return p[v]
  }, args)
}

function isCallbackAction(action) {
  return action.type === 'komondor' && action.name === 'callback'
}
