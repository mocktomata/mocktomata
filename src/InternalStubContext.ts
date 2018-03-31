import { StubContext, SpecAction, Plugin, StubCall, SimulationMismatch, CallOptions } from 'komondor-plugin'
import { tersify } from 'tersify'
import { unpartial } from 'unpartial'

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
  args: any[]
  stubArgs: any[]
  constructor(public context: InternalStubContext, public invokeId: number) { }
  invoked<T extends any[]>(args: T, options?: CallOptions): T {
    const meta = unpartial({ name: 'invoke' }, options)
    const name = meta.name
    delete meta.name
    this.args = args

    const action = this.context.peek()
    log.onDebug(() => `invoked (${this.context.plugin.type}, ${this.context.instanceId}, ${this.invokeId}) with ${tersify(args)}, for ${tersify(action, { maxLength: Infinity })}`)

    // TODO: check for meta matching
    if (!action || action.type !== this.context.plugin.type || action.name !== name || !this.argsMatch(action.payload, args)) {
      throw new SimulationMismatch(this.context.specId, { type: this.context.plugin.type, name, payload: args }, action)
    }

    this.context.callListeners(action)
    this.context.next()
    this.processUntilReturn()

    return args
  }
  peek() {
    return this.context.peek()
  }
  next() {
    return this.context.next()
  }
  isReturnAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'return' &&
      action.instanceId === this.context.instanceId &&
      action.meta.invokeId === this.invokeId
  }
  isThrowAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'throw' &&
      action.instanceId === this.context.instanceId &&
      action.meta.invokeId === this.invokeId
  }
  getSourceCall(sourceContext: InternalStubContext, action: SpecAction) {
    return sourceContext.calls.find((c: CallPlayer) => c.invokeId === action.meta.sourceInvokeId) as CallPlayer
  }
  processUntilReturn() {
    let action = this.context.peek()

    while (action && !this.isReturnAction(action) && !this.isThrowAction(action)) {
      log.onDebug(() => `processing ${tersify(action, { maxLength: Infinity })} by (${this.context.plugin.type}, ${this.context.instanceId}, ${this.invokeId})`)
      if (isCallbackAction(action)) {
        const subject = locateCallback(action.meta, this.args)
        this.context.next()
        this.context.callListeners(action)
        subject(...action.payload)
      }
      else {
        log.debug('skipping??')
        this.context.next()
      }

      action = this.context.peek()
    }

    if (!action) {
      throw new MissingReturnRecord()
    }

    log.onDebug(() => `processUntilReturn exiting with ${tersify(action)}`)
  }
  getSourceContext(meta) {
    const entry = this.context.contexts.find(c =>
      c.type === meta.sourceType &&
      c.instanceId === meta.sourceInstanceId)

    return entry && entry.instance
  }
  succeed(options?: CallOptions): boolean {
    const meta = unpartial({ name: 'return' }, options)
    const name = meta.name
    delete meta.name

    const action = this.context.peek()
    // TODO: compate meta
    return !!action &&
      action.type === this.context.plugin.type &&
      action.name === name &&
      action.instanceId === this.context.instanceId
  }
  failed(options?: CallOptions): boolean {
    const meta = unpartial({ name: 'throw' }, options)
    const name = meta.name
    delete meta.name

    const action = this.context.peek()
    // TODO: compare meta
    return !!action &&
      action.type === this.context.plugin.type &&
      action.name === name &&
      action.instanceId === this.context.instanceId
  }
  result(): boolean {
    const action = this.context.peek()!
    this.context.callListeners(action)
    this.context.next()
    const { returnType, returnInstanceId } = action.meta
    let nextAction = this.context.peek()

    let result
    if (returnType && returnInstanceId) {
      while (nextAction && isCallbackAction(nextAction)) {
        const sourceContext = this.getSourceContext(nextAction.meta)!
        const sourceCall = this.getSourceCall(sourceContext, nextAction)
        const subject = locateCallback(nextAction.meta, sourceCall.args)
        this.context.next()
        this.context.callListeners(nextAction)
        subject(...nextAction.payload)
        nextAction = this.context.peek()
      }

      if (nextAction && nextAction.type === returnType && nextAction.instanceId === returnInstanceId) {
        log.debug(`nextaction: ${tersify(nextAction)}`)
        const plugin = plugins.find(p => p.type === nextAction!.type)
        if (plugin) {
          const childContext = this.context.createChildContext(plugin, undefined)
          result = plugin.getStub(childContext, undefined, nextAction)
        }
      }
      else {
        // log.debug(`return result does not match with next action ${tersify(nextAction)}`)
      }
    }
    else {
      log.onDebug(() => `returning result: ${result} from action ${tersify(action)}`)
    }

    setImmediate(() => {
      let action = this.context.peek()
      while (action && isCallbackAction(action)) {
        const sourceContext = this.getSourceContext(action.meta)!
        const sourceCall = this.getSourceCall(sourceContext, action)
        const subject = locateCallback(action.meta, sourceCall.args)
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
      else if (expected[i] !== actual[i]) {
        match = false
        break;
      }
    }
    return match
  }
}

export class InternalStubContext implements StubContext {
  actionTracker: ActionTracker
  events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
  listenAll: ((action) => void)[] = []
  instanceId: number
  invokeCount = 0
  invokeSubject: boolean
  actionCounter = 0
  contexts: { type: string, instanceId: number, instance: InternalStubContext }[]
  pluginMap: { [k: string]: number }
  calls: StubCall[] = []
  constructor(
    context,
    public specId: string,
    public plugin: Plugin<any>,
    public subject
  ) {
    this.actionTracker = context.actionTracker
    this.events = context.events
    this.listenAll = context.listenAll
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
  processNext() {
    this.next()
    const action = this.peek()
    if (!action) return
  }
  peek(): SpecAction | undefined {
    return this.actionTracker.peek()
  }
  on(actionType: string, name: string, callback: (action: SpecAction) => void) {
    if (!this.events[actionType])
      this.events[actionType] = {}
    if (!this.events[actionType][name])
      this.events[actionType][name] = []
    this.events[actionType][name].push(callback)
  }
  onAny(callback: (action: SpecAction) => void) {
    this.listenAll.push(callback)
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
  createChildContext(plugin, subject, _key?) {
    const childContext = new InternalStubContext(
      this,
      this.specId,
      plugin,
      subject
    )
    childContext.invokeSubject = true
    return childContext
  }
}

function locateCallback(meta, args) {
  if (!meta.sourcePath) {
    return args.find(arg => typeof arg === 'function')
  }

  return meta.sourcePath.reduce((p, v) => {
    return p[v]
  }, args)
}

function isCallbackAction(action) {
  return action.type === 'komondor' && action.name === 'callback'
}
