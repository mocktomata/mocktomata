import { StubContext } from 'komondor-plugin'

// function inputMatches(a, b: any[]) {
//   // istanbul ignore next
//   if (b.length !== a.length)
//     return false
//   let match = true
//   for (let i = 0; i < b.length; i++) {
//     const value = b[i]
//     const valueType = typeof value
//     if (valueType === 'function') continue
//     if (valueType === 'object') {
//       // istanbul ignore next
//       if (typeof a !== 'object') {
//         match = false
//         break
//       }

//       const va = a[i]
//       match = !Object.keys(value).some(k => {
//         if (typeof value[k] === 'function') return false
//         return value[k] !== va[k]
//       })
//       if (!match)
//         break;
//     }
//     else if (b[i] !== a[i]) {
//       match = false
//       break;
//     }
//   }
//   return match
// }

function locateCallback(meta, args) {
  if (!meta.sourcePath) {
    return args.find(arg => typeof arg === 'function')
  }

  return meta.sourcePath.reduce((p, v) => {
    return p[v]
  }, args)
}

export function stubFunction(context: StubContext, subject) {
  console.log('new stub', context.instanceId)

  // let currentId = 0
  const call = context.newCall()
  return function (...args) {
    console.log('calling', context.instanceId, args)
    const stubArgs = call.invoked(args)
    const action = context.peek()
    if (!action) {
      throw new Error('missing return action')
    }
    // console.log('next action', context.instanceId, action, call.succeed(), call.failed())
    // if (call.succeed()) {
    //   const result = call.result()
    //   console.log('fn result', result)
    //   return result
    // }
    // if (call.failed()) {
    //   const t = call.thrown()
    //   console.log('thrown value', t)
    //   throw t
    // }


    // if (action.type === 'function' && action.name === 'return' && action.meta.instanceId === context.instanceId) {
    //   console.log('returning')
    //   // todo: context.getStub(context...) <-- doesn't make sense.
    //   const result = context.getStub(context, action) || action.payload
    //   console.log('result is', result)
    //   context.next()
    //   return result
    // }

    // if (action.type === 'function' && action.name === 'invoke' && action.meta.sourceType === 'function' && action.meta.sourceInstanceId === context.instanceId) {
    //   // run the stubs to simulate further behaviors
    //   const stubCallback = locateCallback(action.meta, stubArgs)
    //   stubCallback(...action.payload)
    //   // run the actual callback to response to caller
    //   // I have some concern that this may make actual remote
    //   // calls that we try to stub.
    //   const callback = locateCallback(action.meta, args)
    //   callback(...action.payload)
    // }

    // if (action.type === 'function/throw' && action.meta.sourceType === 'function' && action.meta.sourceInstanceId === context.instanceId) {
    //   const callback = locateCallback(action.meta, stubArgs)
    //   console.log(callback)
    //   callback(...action.payload)
    // }

    const a = context.peek()
    console.log('after handled callback, next action', context.instanceId, a, call.succeed(), call.failed())
    if (call.succeed()) {
      return call.result()
    }
    else
      throw call.thrown()


    //   const invokeAction = context.peek()
    // if (!invokeAction || !isInvokeAction(invokeAction) || !inputMatches(invokeAction.payload, args)) {
    //   throw new SimulationMismatch(context.specId, { type: 'function/invoke', payload: args }, invokeAction)
    // }

    // console.log('peek', invokeAction)
    // context.
    //   currentId = Math.max(currentId, invokeAction.meta.instanceId)
    // context.next()
    // const result = processUntilReturn()

    // process.nextTick(() => {
    //   let action = context.peek()
    //   while (action && action.meta.instanceId <= currentId) {
    //     context.next()
    //     if (action.type === 'function/invoke') {
    //       const callback = locateCallback(action.meta, args)
    //       callback(...action.payload)
    //     }
    //     action = context.peek()
    //   }
    // })
    // return result
    // function processUntilReturn() {
    //   const action = context.peek()
    //   console.log('action', action, args)
    //   if (!action) return undefined
    //   if (action.meta.instanceId > currentId) return undefined

    //   if (action.type === 'function/return') {
    //     const result = action.meta && context.getStub(context, action) || action.payload
    //     console.log('return', result)
    //     context.next()
    //     return result
    //   }

    //   context.next()
    //   if (action.type === 'function/invoke') {
    //     const callback = locateCallback(action.meta, args)
    //     console.log(callback)
    //     callback(...action.payload)
    //   }

    //   if (action.type === 'function/throw') {
    //     throw action.payload
    //   }
    //   return processUntilReturn()
    // }
  }
}
