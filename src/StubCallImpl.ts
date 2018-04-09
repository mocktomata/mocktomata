import { StubCall, SpecAction, SimulationMismatch } from 'komondor-plugin'
import { createSatisfier } from 'satisfier'
import { tersify } from 'tersify'

import { MissingReturnRecord } from './errors'
import { log } from './log'
import { plugins } from './plugin'
import { StubInstanceImpl } from './StubInstanceImpl'

export class StubCallImpl implements StubCall {
  args: any[]
  original: any
  constructor(public instance: StubInstanceImpl, public invokeId: number) {
    log.onDebug(() => `${this.debugId()}: stub created`)
  }
  invoked<T extends any[]>(args: T, meta?: { [k: string]: any }): T {
    const name = 'invoke'
    this.args = args

    const action = this.instance.context.peek()
    log.onDebug(() => `${this.debugId()}: invoked(${tersify(args)}), for ${tersify(action, { maxLength: Infinity })}`)

    this.ensureMatching(action, {
      type: this.instance.context.plugin.type,
      name,
      payload: args,
      meta
    })

    this.instance.context.callListeners(action)
    this.instance.context.next()

    return args
  }
  // istanbul ignore next
  peek() {
    return this.instance.context.peek()
  }
  // istanbul ignore next
  next() {
    return this.instance.context.next()
  }
  wait(meta?: { [k: string]: any; } | undefined): Promise<SpecAction> {
    return new Promise((a, r) => {
      let processed = false
      this.instance.context.onAny(action => {
        if (!processed) {
          if (action.type === this.instance.context.plugin.type &&
            action.name === 'trigger' || 'return' &&
            action.instanceId === this.instance.instanceId &&
            action.invokeId === this.invokeId) {
            if (!meta || createSatisfier(meta).test(action.meta)) {
              processed = true
              a(this.result())
            }
            else {
              processed = true
              r(this.thrown())
            }
          }
        }
      })
      this.waitSync()
    })
  }
  waitSync(): void {
    this.processUntilReturn()
  }
  succeed(meta?: { [k: string]: any }): boolean {
    const action = this.instance.context.peek()
    return !!action &&
      action.type === this.instance.context.plugin.type &&
      action.name === 'return' &&
      action.instanceId === this.instance.instanceId &&
      (meta === undefined || createSatisfier(meta).test(action.meta))
  }
  result(): any {
    const action = this.instance.context.peek()!
    this.instance.context.callListeners(action)
    this.instance.context.next()
    const { returnType, returnInstanceId } = action

    let result
    if (returnType && returnInstanceId) {
      let nextAction = this.instance.context.peek()
      while (nextAction && isCallbackAction(nextAction)) {
        log.debug(`${this.debugId()}: next callback ${tersify(nextAction)}`)

        const sourceContext = this.getSourceContext(nextAction)!
        const sourceCall = this.getSourceCall(sourceContext, nextAction)
        const subject = locateCallback(nextAction, sourceCall.args)
        this.instance.context.next()
        this.instance.context.callListeners(nextAction)
        subject(...nextAction.payload)
        nextAction = this.instance.context.peek()
      }

      if (nextAction && nextAction.type === returnType && nextAction.instanceId === returnInstanceId) {
        log.debug(`${this.debugId()}: next action ${tersify(nextAction)}`)
        const plugin = plugins.find(p => p.type === nextAction!.type)
        if (plugin) {
          const childContext = this.instance.context.createChildContext(plugin)
          result = plugin.getStub(childContext, undefined)
        }
      }
      else {
        log.warn(`${this.debugId()}: next action not match ${tersify(nextAction)}`)
      }
    }

    setImmediate(() => {
      let action = this.instance.context.peek()
      while (action && isCallbackAction(action)) {
        const sourceContext = this.getSourceContext(action)!
        const sourceCall = this.getSourceCall(sourceContext, action)
        const subject = locateCallback(action, sourceCall.args)
        this.instance.context.next()
        this.instance.context.callListeners(action)
        subject(...action.payload)
        action = this.instance.context.peek()
      }
    })
    return result !== undefined ? result : action.payload
  }
  thrown(): boolean {
    const action = this.instance.context.peek()!
    this.instance.context.callListeners(action)
    this.instance.context.next()
    return action.payload
  }
  isReturnAction(action: SpecAction): boolean {
    return action.type === this.instance.context.plugin.type &&
      action.name === 'return' &&
      action.instanceId === this.instance.instanceId &&
      action.invokeId === this.invokeId
  }
  isThrowAction(action: SpecAction): boolean {
    return action.type === this.instance.context.plugin.type &&
      action.name === 'throw' &&
      action.instanceId === this.instance.instanceId &&
      action.invokeId === this.invokeId
  }
  processUntilReturn() {
    let action = this.instance.context.peek()

    while (action && !this.isReturnAction(action) && !this.isThrowAction(action)) {
      log.onDebug(() => `${this.debugId()}: processing ${tersify(action, { maxLength: Infinity })}`)
      if (isCallbackAction(action)) {
        const subject = locateCallback(action, this.args)
        this.instance.context.next()
        this.instance.context.callListeners(action)
        subject(...action.payload)
      }
      else {
        log.onWarn(() => `${this.debugId()}: skipping over: don't know how to handle ${tersify(action)}`)
        this.instance.context.next()
      }

      action = this.instance.context.peek()
    }

    if (!action) {
      throw new MissingReturnRecord()
    }

    log.onDebug(() => `${this.debugId()}: processing exits with ${tersify(action)}`)
    this.instance.context.callListeners(action)
  }
  getSourceContext(action) {
    const entry = this.instance.context.instances.find(c =>
      c.type === action.sourceType &&
      c.instanceId === action.sourceInstanceId)

    return entry && entry.instance
  }
  getSourceCall(sourceInstance: StubInstanceImpl, action: SpecAction) {
    return sourceInstance.calls.find((c: StubCallImpl) => c.invokeId === action.sourceInvokeId) as StubCallImpl
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
      throw new SimulationMismatch(this.instance.context.specId, expected, action)
    }
  }
  private debugId() {
    return `(${this.instance.context.plugin.type}, ${this.instance.instanceId}, ${this.invokeId})`
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
