import { StubContext, SpecAction, ReturnAction, Plugin, StubCall, SimulationMismatch, CallOptions } from 'komondor-plugin'

import { plugins } from './plugin'
import { unpartial } from 'unpartial';


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
  constructor(public context: InternalStubContext, public invokeId: number) {

  }
  invoked<T extends any[]>(args: T, options?: CallOptions): T {
    const meta = unpartial({ name: 'invoke' }, options)
    const name = meta.name
    delete meta.name

    const action = this.context.peek()
    console.log('invoke', this.context.instanceId, action)
    // TODO: check for meta matching
    if (!action || action.type !== this.context.plugin.type || action.name !== name || !this.argsMatch(action.payload, args)) {
      throw new SimulationMismatch(this.context.specId, { type: this.context.plugin.type, name, payload: args }, action)
    }

    this.context.callListeners(action)
    const stubArgs = args.map((arg, i) => {
      const plugin = plugins.find(p => p.support(arg))
      if (plugin) {
        const childContext = this.context.createChildContext(plugin, arg, i)
        return plugin.getStub(childContext, arg, action) || arg
      }
      if (typeof arg === 'object' && arg !== null) {
        const result = {}
        Object.keys(arg).forEach(key => {
          const prop = arg[key]
          const plugin = plugins.find(p => p.support(prop))
          if (plugin) {
            const childContext = this.context.createChildContext(plugin, i, key)
            result[key] = plugin.getStub(childContext, prop, action) || arg
          }
          else
            result[key] = prop
        })
        return result
      }
      return arg
    })
    this.args = args
    this.stubArgs = stubArgs
    this.context.next()
    this.processCallbacks()

    return stubArgs as T
    // const nextAction = this.context.peek()
    // if (!nextAction) {
    //   // this call didn't return?
    //   return
    // }

    // if (nextAction.meta.sourceType === this.context.plugin.type && nextAction.meta.sourceInstanceId === this.context.instanceId) {
    //   const subject = locateSubject(args, nextAction.meta.sourcePath)
    //   const plugin = plugins.find(p => p.support(arg))
    //   if (plugin) {
    //     const childContext = this.context.createChildContext(plugin, nextAction.meta.sourcePath[0])
    //     plugin.getStub(childContext, subject, nextAction)
    //   }

    // }
    // console.log(action)
    // console.log('invoked', args)
    // const plugin = plugins.find(p => p.support(args))

    // this.context.processNext()
  }
  processCallbacks() {
    const action = this.context.peek()
    if (action) {
      if (action.type === 'function' && action.name === 'invoke' && action.meta.sourceType === 'function' && action.meta.sourceInstanceId === this.context.instanceId) {
        // run the stubs to simulate further behaviors
        const stubCallback = locateCallback(action.meta, this.stubArgs)
        stubCallback(...action.payload)
        // run the actual callback to response to caller
        // I have some concern that this may make actual remote
        // calls that we try to stub.
        const callback = locateCallback(action.meta, this.args)
        callback(...action.payload)
      }
    }
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
    const { returnType, returnId } = action.meta
    const nextAction = this.context.peek()
    let result
    if (returnType && returnId) {
      if (nextAction && nextAction.type === returnType && nextAction.meta.instanceId === returnId) {
        const plugin = plugins.find(p => p.type === nextAction.type)
        if (plugin) {
          const childContext = this.context.createChildContext(plugin, undefined)
          result = plugin.getStub(childContext, undefined, nextAction)
        }
      }
    }
    else {
      console.log('result next', nextAction)
      if (nextAction && nextAction.meta.sourceType) {
        // look up source and arg, and invoke
        const sourceContext = this.context.contexts.find(c =>
          c.type === nextAction.meta.sourceType &&
          c.instanceId === nextAction.meta.sourceInstanceId)
        const sourceCall: CallPlayer = sourceContext!.instance.calls.find((c: CallPlayer) => c.invokeId === nextAction.meta.sourceInvokeId) as any
        sourceCall.stubArgs[0](...nextAction.payload)
        sourceCall.args[0](...nextAction.payload)
      }
    }

    return result !== undefined ? result : action.payload
  }
  thrown(): boolean {
    const action = this.context.peek()!
    this.context.callListeners(action)
    this.context.next()
    return action.payload
  }
  argsMatch(actual, expected: any[]) {
    console.log('argMatch', actual, expected)
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
//     const { returnType, returnId } = action.meta
//     const nextAction = this.context.peek()
//     let result
//     if (returnType && returnId) {
//       if (nextAction && nextAction.type === returnType && nextAction.meta.instanceId === returnId) {
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
