import { StubContext, SpecAction, ReturnAction, Plugin, StubCall, SimulationMismatch, CallOptions } from 'komondor-plugin'
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
  isReturnAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'return' &&
      action.meta.instanceId === this.context.instanceId &&
      action.meta.invokeId === this.invokeId
  }
  isThrowAction(action: SpecAction): boolean {
    return action.type === this.context.plugin.type &&
      action.name === 'throw' &&
      action.meta.instanceId === this.context.instanceId &&
      action.meta.invokeId === this.invokeId
  }
  getSourceCall(sourceContext: InternalStubContext, action: SpecAction) {
    return sourceContext.calls.find((c: CallPlayer) => c.invokeId === action.meta.sourceInvokeId) as CallPlayer
    // if (!sourceCall) {
    //   const newCall = sourceContext.newCall()
    //   console.log('newCall', (newCall as any).context.instanceId, (newCall as any).invokeId)
    //   newCall.invoked(action.payload)

    // }
  }
  processUntilReturn() {
    let action = this.context.peek()

    while (action && !this.isReturnAction(action) && !this.isThrowAction(action)) {
      log.onDebug(() => `processing ${tersify(action, { maxLength: Infinity })} by (${this.context.plugin.type}, ${this.context.instanceId}, ${this.invokeId})`)
      if (isCallbackAction(action)) {
        const subject = locateCallback(action.meta, this.args)
        console.log('callback sub', subject)
        this.context.next()
        this.context.callListeners(action)
        subject(...action.payload)
      }
      else {
        log.debug('skipping??')
        this.context.next()
      }
      // const sourceContext = this.getSourceContext(action.meta)
      // if (sourceContext) {
      //   let sourceCall = this.getSourceCall(sourceContext, action)

      //   console.log('locale callback...', action.payload, sourceCall.args)
      //   const subject = locateCallback(action.meta, sourceCall.args)
      //   this.context.next()
      //   subject(...action.payload)
      // }
      // else {
      //   // no source, invoke real subject hold by the stub
      //   const nextContext = this.context.contexts.find(c => c.type === action!.type && c.instanceId === action!.meta.instanceId)
      //   if (!nextContext) {
      //     throw new Error(`Can't find context for ${tersify(action)}`)
      //   }

      //   // const wrap = (...args) => {
      //   //   const call = nextContext.instance.newCall()
      //   //   call.invoked(args)
      //   //   console.log('right before callback')
      //   //   // this.context.next()
      //   //   // const stubed = plugin.getStub(childContext, subject, action)
      //   //   nextContext.instance.subject(...args)
      //   //   console.log('right after callback')
      //   //   if (call.succeed()) {
      //   //     return call.result()
      //   //   }
      //   //   else
      //   //     throw call.thrown()
      //   // }
      //   // // console.log('paylog', action.payload, nextContext.instance.)
      //   // // should call with real thing, with callback function
      //   // wrap(...action.payload)
      // }


      action = this.context.peek()
    }

    if (!action) {
      throw new MissingReturnRecord()
    }

    log.onDebug(() => `processUntilReturn exiting with ${tersify(action)}`)

    // if (action.meta.returnType) {
    //   // return
    //   return
    // }

    // if (sourceContext) {
    //   const sourceCall = sourceContext.instance.calls.find((c: CallPlayer) => c.invokeId === action.meta.sourceInvokeId) as CallPlayer
    //   if (!sourceCall) {
    //     const newCall = sourceContext.instance.newCall()
    //     console.log('newCall', (newCall as any).context.instanceId, (newCall as any).invokeId)
    //     newCall.invoked(action.payload)

    //   }
    //   else {
    //     // const subject = locateSubject(args, action.meta.sourcePath)
    //     const subject = locateCallback(action.meta, sourceCall.args)
    //     const plugin = plugins.find(p => p.support(subject))
    //     if (plugin) {
    //       const childContext = this.context.createChildContext(plugin, subject)
    //       console.log('new child', childContext.instanceId)
    //       const wrap = (...args) => {
    //         const call = childContext.newCall()
    //         call.invoked(args)
    //         console.log('right before callback')
    //         // this.context.next()
    //         // const stubed = plugin.getStub(childContext, subject, action)
    //         subject(...args)
    //         console.log('right after callback')
    //         if (call.succeed()) {
    //           return call.result()
    //         }
    //         else
    //           throw call.thrown()
    //       }
    //       wrap(...action.payload)
    //     }
    //   }
    // }
    // else {
    //   return
    // }
    // this.processCallbacks()
  }
  getSourceContext(meta) {
    const entry = this.context.contexts.find(c =>
      c.type === meta.sourceType &&
      c.instanceId === meta.sourceInstanceId)

    return entry && entry.instance
  }
  // processCallbacks() {
  //   const action = this.context.peek()
  //   console.log('processCallbacks', action)
  //   if (action) {
  //     if (action.type === this.context.plugin.type &&
  //       action.name === 'invoke' &&
  //       action.meta.sourceType === this.context.plugin.type &&
  //       action.meta.sourceInstanceId === this.context.instanceId) {
  //       // run the stubs to simulate further behaviors
  //       // const stubCallback = locateCallback(action.meta, this.stubArgs)
  //       // stubCallback(...action.payload)
  //       // run the actual callback to response to caller
  //       // I have some concern that this may make actual remote
  //       // calls that we try to stub.
  //       const callback = locateCallback(action.meta, this.args)
  //       console.log('right before callback')
  //       callback(...action.payload)
  //       console.log('right after callback')
  //       // this.context.next()
  //     }
  //   }
  // }
  succeed(options?: CallOptions): boolean {
    const meta = unpartial({ name: 'return' }, options)
    const name = meta.name
    delete meta.name

    const action = this.context.peek()
    // TODO: compate meta
    return !!action &&
      action.type === this.context.plugin.type &&
      action.name === name &&
      action.meta.instanceId === this.context.instanceId
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
      action.meta.instanceId === this.context.instanceId
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
        // console.log('in setImmediate, callback subject: ', subject)
        this.context.next()
        this.context.callListeners(nextAction)
        subject(...nextAction.payload)
        nextAction = this.context.peek()
      }

      if (nextAction && nextAction.type === returnType && nextAction.meta.instanceId === returnInstanceId) {
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
      // console.log('result next', nextAction)
      // if (nextAction && nextAction.meta.sourceType) {
      //   // look up source and arg, and invoke
      //   const sourceContext = this.context.contexts.find(c =>
      //     c.type === nextAction.meta.sourceType &&
      //     c.instanceId === nextAction.meta.sourceInstanceId)
      //   const sourceCall: CallPlayer = sourceContext!.instance.calls.find((c: CallPlayer) => c.invokeId === nextAction.meta.sourceInvokeId) as any
      //   // this.context.next()
      //   console.log('sourceCall', sourceCall)
      //   // sourceCall.stubArgs[0](...nextAction.payload)
      //   sourceCall.args[0](...nextAction.payload)
      // }
    }

    setImmediate(() => {
      let action = this.context.peek()
      while (action && isCallbackAction(action)) {
        const sourceContext = this.getSourceContext(action.meta)!
        const sourceCall = this.getSourceCall(sourceContext, action)
        const subject = locateCallback(action.meta, sourceCall.args)
        // console.log('in setImmediate, callback subject: ', subject)
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
    console.log('new child context', plugin.type, 'instanceID', this.instanceId)
    this.contexts.push({ type: plugin.type, instanceId: this.instanceId, instance: this })
  }
  newCall(): StubCall {
    const call = new CallPlayer(this, ++this.invokeCount)
    this.calls.push(call)
    return call
  }
  next(): void {
    console.log('next called')
    this.actionTracker.next()
    // const action = this.actionTracker.peek()
    // if (action) {
    //   this.callListeners(action)
    // }
  }
  processNext() {
    this.next()
    const action = this.peek()
    if (!action) return

    console.log('processNext', action)
    // if (action.meta.sourceType) {
    //   const context = this.contexts.find(c => action.meta.sourceType === c.type && c.instanceId === action.meta.sourceInstanceId)!
    //   const call = context.instance.calls[action.meta.sourceInvokeId]
    //   const callback = call.locateCallback(action.meta.sourcePath)
    //   callback(...action.payload)
    //   console.log(context)
    // }
    // if (!context) {
    //   plugins.find(p => p.support)
    //   this.createChildCont
    // }
    // if (isReturnAction(action)) return

    // create child context and invoke stubs
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
  getStub(context: StubContext, action: ReturnAction) {
    const plugin = plugins.find(p => action && action.meta.returnType === p.type)
    if (plugin)
      return plugin.getStub(context, this.subject, action)
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
    // childContext.sourceInstanceId = this.instanceId
    // childContext.sourceType = plugin.type
    // childContext.sourcePath = key !== undefined ? [...this.sourcePath, key] : this.sourcePath
    return childContext
  }
}
// import { StubContext, SpecAction, ReturnAction, Plugin, StubCall, SimulationMismatch, CallOptions } from 'komondor-plugin'

// import { plugins } from './plugin'
// import { unpartial } from 'unpartial';

// function locateCallback(meta, args) {
//   if (!meta.sourcePath) {
//     return args.find(arg => typeof arg === 'function')
//   }

//   return meta.sourcePath.reduce((p, v) => {
//     return p[v]
//   }, args)
// }

// export class ActionTracker {
//   currentIndex = 0
//   constructor(public actions: SpecAction[]) { }
//   peek() {
//     return this.actions[this.currentIndex]
//   }
//   next() {
//     this.currentIndex++
//   }
// }

// class CallPlayer implements StubCall {
//   args: any[]
//   stubArgs: any[]
//   constructor(public context: InternalStubContext, public invokeId: number) {

//   }
//   invoked<T extends any[]>(args: T, options?: CallOptions): T {
//     const meta = unpartial({ name: 'invoke' }, options)
//     const name = meta.name
//     delete meta.name

//     this.args = args
//     const action = this.context.peek()
//     console.log('invoke', this.context.instanceId, action)
//     // TODO: check for meta matching
//     if (!action || action.type !== this.context.plugin.type || action.name !== name || !this.argsMatch(action.payload, args)) {
//       throw new SimulationMismatch(this.context.specId, { type: this.context.plugin.type, name, payload: args }, action)
//     }

//     this.stubArgs = args.map((arg, i) => {
//       const plugin = plugins.find(p => p.support(arg))
//       if (plugin) {
//         const childContext = this.context.createChildContext(plugin, arg, i)
//         return plugin.getStub(childContext, arg, action) || arg
//       }
//       if (typeof arg === 'object' && arg !== null) {
//         const result = {}
//         Object.keys(arg).forEach(key => {
//           const prop = arg[key]
//           const plugin = plugins.find(p => p.support(prop))
//           if (plugin) {
//             const childContext = this.context.createChildContext(plugin, i, key)
//             result[key] = plugin.getStub(childContext, prop, action)
//           }
//           else
//             result[key] = prop
//         })
//         return result
//       }
//       return arg
//     })

//     this.context.callListeners(action)
//     this.context.next()
//     this.processUntilReturn()
//     // process until return for this call is reached.
//     return this.stubArgs as T
//     // const nextAction = this.context.peek()
//     // if (!nextAction) {
//     //   // this call didn't return?
//     //   return
//     // }

//     // if (nextAction.meta.sourceType === this.context.plugin.type && nextAction.meta.sourceInstanceId === this.context.instanceId) {
//     //   const subject = locateSubject(args, nextAction.meta.sourcePath)
//     //   const plugin = plugins.find(p => p.support(arg))
//     //   if (plugin) {
//     //     const childContext = this.context.createChildContext(plugin, nextAction.meta.sourcePath[0])
//     //     plugin.getStub(childContext, subject, nextAction)
//     //   }

//     // }
//     // console.log(action)
//     // console.log('invoked', args)
//     // const plugin = plugins.find(p => p.support(args))

//     // this.context.processNext()
//   }
//   isReturnActionOfCall(action) {
//     return action.type === this.context.plugin.type &&
//       action.name === 'return' &&
//       action.meta.instanceId === this.context.instanceId &&
//       action.meta.invokeId === this.invokeId
//   }
//   processUntilReturn() {
//     let action = this.context.peek()
//     while (action !== undefined && !this.isReturnActionOfCall(action)) {
//       if (action.meta.sourceType) {
//         // no sourceType meaning it is not an callback.
//         // the action is invoked by the user
//         // need to wait for that to happen
//         const sourceContext = this.context.contexts.find(c =>
//           c.type === action!.meta.sourceType &&
//           c.instanceId === action!.meta.sourceInstanceId)
//         const sourceCall: CallPlayer = sourceContext!.instance.calls.find((c: CallPlayer) => c.invokeId === action!.meta.sourceInvokeId) as any
//         const stubCallback = locateCallback(action.meta, sourceCall.stubArgs)
//         // const callback = locateCallback(action.meta, sourceCall.args)
//         stubCallback(...action.payload)
//         // callback(...action.payload)
//       }
//       this.context.callListeners(action)
//       this.context.next()
//       action = this.context.peek()
//     }
//     return
//     if (action === undefined) return


//     if (action.meta.sourcType) {

//     }
//     this.context.next()
//     let nextAction = this.context.peek()!
//     if (nextAction === undefined) return // or throw
//     console.log('processUntilReturn', nextAction)
//     if (nextAction.meta.sourceType) {
//       // no sourceType meaning it is not an callback.
//       // the action is invoked by the user
//       // need to wait for that to happen
//       const sourceContext = this.context.contexts.find(c =>
//         c.type === nextAction.meta.sourceType &&
//         c.instanceId === nextAction.meta.sourceInstanceId)
//       const sourceCall: CallPlayer = sourceContext!.instance.calls.find((c: CallPlayer) => c.invokeId === nextAction.meta.sourceInvokeId) as any
//       const stubCallback = locateCallback(nextAction.meta, sourceCall.stubArgs)
//       // const callback = locateCallback(action.meta, sourceCall.args)
//       stubCallback(...nextAction.payload)
//       // callback(...action.payload)
//     }
//     // while (!(action.type === type &&
//     //   action.meta.instanceId === instanceId &&
//     //   action.meta.invokeId === invokeId)) {
//     //   const plugin = plugins.find(p => p.type === action!.type)
//     //   if (plugin) {
//     //     const childContext = this.context.createChildContext(plugin, undefined)
//     //     result = plugin.getStub(childContext, undefined, nextAction)
//     //   }
//     // }
//   }
//   succeed(options?: CallOptions): boolean {
//     const meta = unpartial({ name: 'return' }, options)
//     const name = meta.name
//     delete meta.name

//     const action = this.context.peek()
//     // TODO: compate meta
//     return !!action &&
//       action.type === this.context.plugin.type &&
//       action.name === name &&
//       action.meta.instanceId === this.context.instanceId
//   }
//   failed(options?: CallOptions): boolean {
//     const meta = unpartial({ name: 'throw' }, options)
//     const name = meta.name
//     delete meta.name

//     const action = this.context.peek()
//     // TODO: compare meta
//     return !!action &&
//       action.type === this.context.plugin.type &&
//       action.name === name &&
//       action.meta.instanceId === this.context.instanceId
//   }
//   result(): boolean {
//     const action = this.context.peek()!
//     this.context.callListeners(action)

//     this.context.next()
//     const { returnType, returnInstanceId } = action.meta
//     const nextAction = this.context.peek()
//     let result
//     if (returnType && returnInstanceId) {
//       if (nextAction && nextAction.type === returnType && nextAction.meta.instanceId === returnInstanceId) {
//         const plugin = plugins.find(p => p.type === nextAction.type)
//         if (plugin) {
//           const childContext = this.context.createChildContext(plugin, undefined)
//           result = plugin.getStub(childContext, undefined, nextAction)
//         }
//       }
//     }
//     else {
//       console.log('result next', nextAction)
//       if (nextAction && nextAction.meta.sourceType) {
//         // look up source and arg, and invoke
//         const sourceContext = this.context.contexts.find(c =>
//           c.type === nextAction.meta.sourceType &&
//           c.instanceId === nextAction.meta.sourceInstanceId)
//         const sourceCall: CallPlayer = sourceContext!.instance.calls.find((c: CallPlayer) => c.invokeId === nextAction.meta.sourceInvokeId) as any
//         sourceCall.stubArgs[0](...nextAction.payload)
//         sourceCall.args[0](...nextAction.payload)
//       }
//     }

//     return result !== undefined ? result : action.payload
//   }
//   thrown(): boolean {
//     const action = this.context.peek()!
//     this.context.callListeners(action)
//     this.context.next()
//     return action.payload
//   }
//   argsMatch(actual, expected: any[]) {
//     // console.log('argMatch', actual, expected)
//     // istanbul ignore next
//     if (expected.length !== actual.length)
//       return false
//     let match = true
//     for (let i = 0; i < expected.length; i++) {
//       const value = expected[i]
//       const valueType = typeof value
//       if (valueType === 'function') continue
//       if (valueType === 'object' && value !== null) {
//         // istanbul ignore next
//         if (typeof actual !== 'object') {
//           match = false
//           break
//         }

//         const va = actual[i]
//         match = !Object.keys(value).some(k => {
//           if (typeof value[k] === 'function') return false
//           return value[k] !== va[k]
//         })
//         if (!match)
//           break;
//       }
//       else if (expected[i] !== actual[i]) {
//         match = false
//         break;
//       }
//     }
//     return match
//   }
// }

// export class InternalStubContext implements StubContext {
//   actionTracker: ActionTracker
//   events: { [type: string]: { [name: string]: ((action) => void)[] } } = {}
//   listenAll: ((action) => void)[] = []
//   instanceId: number
//   invokeCount = 0
//   invokeSubject: boolean
//   actionCounter = 0
//   contexts: { type: string, instanceId: number, instance: InternalStubContext }[]
//   pluginMap: { [k: string]: number }
//   calls: StubCall[] = []
//   constructor(
//     context,
//     public specId: string,
//     public plugin: Plugin<any>,
//     public subject
//   ) {
//     this.actionTracker = context.actionTracker
//     this.events = context.events
//     this.listenAll = context.listenAll
//     this.contexts = context.contexts
//     this.instanceId = this.contexts.filter(c => c.type === plugin.type).length + 1
//     this.contexts.push({ type: plugin.type, instanceId: this.instanceId, instance: this })
//   }
//   newCall(): StubCall {
//     const call = new CallPlayer(this, ++this.invokeCount)
//     this.calls.push(call)
//     return call
//   }
//   next(): void {
//     console.log('context.next() called')
//     this.actionTracker.next()
//     // const action = this.actionTracker.peek()
//     // if (action) {
//     //   this.callListeners(action)
//     // }
//   }
//   processNext() {
//     this.next()
//     const action = this.peek()
//     if (!action) return

//     console.log('processNext', action)
//     // if (action.meta.sourceType) {
//     //   const context = this.contexts.find(c => action.meta.sourceType === c.type && c.instanceId === action.meta.sourceInstanceId)!
//     //   const call = context.instance.calls[action.meta.sourceInvokeId]
//     //   const callback = call.locateCallback(action.meta.sourcePath)
//     //   callback(...action.payload)
//     //   console.log(context)
//     // }
//     // if (!context) {
//     //   plugins.find(p => p.support)
//     //   this.createChildCont
//     // }
//     // if (isReturnAction(action)) return

//     // create child context and invoke stubs
//   }
//   peek(): SpecAction | undefined {
//     return this.actionTracker.peek()
//   }
//   on(actionType: string, name: string, callback: (action: SpecAction) => void) {
//     if (!this.events[actionType])
//       this.events[actionType] = {}
//     if (!this.events[actionType][name])
//       this.events[actionType][name] = []
//     this.events[actionType][name].push(callback)
//   }
//   onAny(callback: (action: SpecAction) => void) {
//     this.listenAll.push(callback)
//   }
//   getStub(context: StubContext, action: ReturnAction) {
//     const plugin = plugins.find(p => action && action.meta.returnType === p.type)
//     if (plugin)
//       return plugin.getStub(context, this.subject, action)
//   }
//   callListeners(action) {
//     if (this.events[action.type]) {
//       if (this.events[action.type][action.name])
//         this.events[action.type][action.name].forEach(cb => cb(action))
//     }
//     if (this.listenAll.length > 0) {
//       this.listenAll.forEach(cb => cb(action))
//     }
//   }
//   createChildContext(plugin, subject, _key?) {
//     const childContext = new InternalStubContext(
//       this,
//       this.specId,
//       plugin,
//       subject
//     )
//     childContext.invokeSubject = true
//     // childContext.sourceInstanceId = this.instanceId
//     // childContext.sourceType = plugin.type
//     // childContext.sourcePath = key !== undefined ? [...this.sourcePath, key] : this.sourcePath
//     return childContext
//   }
// }

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
