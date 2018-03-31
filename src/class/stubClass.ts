import { createSatisfier } from 'satisfier'

import { SimulationMismatch, StubContext } from 'komondor-plugin'

export function stubClass(context: StubContext, subject) {
  // function emitNextActions() {
  //   let action = context.peek()
  //   if (action && action.type === 'class/return') {
  //     let returnStub = context.getStub(context, action)
  //     context.next()
  //     return returnStub || action.payload
  //   }
  // }

  const stubClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondorStub: any = { methods: {} }
    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.__komondorStub.ctorArgs = args

      const action = context.peek()
      console.log('class constructor', action, args)
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        throw new SimulationMismatch(context.specId, 'class/constructor', action)
      }
      context.next()
      // context.on('class', 'invoke', action => {
      //   console.log('invoke listener', action)
      //   const invokeInfo = this.__komondorStub.methods[action.meta.name][action.meta.methodId]
      //   const callback = invokeInfo.callbacks[action.meta.callSite]
      //   callback(...action.payload)
      //   context.next()
      // })
      // context.next()
      // emitNextActions()
    }
  }

  for (let p in stubClass.prototype) {
    stubClass.prototype[p] = function (...args) {
      const call = context.newCall()
      call.invoked(args, { methodName: p })
      // if (!this.__komondorStub.methods[p])
      //   this.__komondorStub.methods[p] = []
      // const invokeInfo = { callbacks: {} }
      // this.__komondorStub.methods[p].push(invokeInfo)

      const action = context.peek()
      if (!action) {
        throw new Error('missing return action')
      }

      console.log('return action', action, args)
      console.log('call.succ', call.succeed(), call.failed())
      if (call.succeed()) {
        return call.result()
      }
      if (call.failed()) {
        throw call.thrown()
      }
      // if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
      //   throw new SimulationMismatch(context.specId, { type: 'class', name: 'invoke', payload: args, meta: { name: p } }, action)
      // }
      // else {
      //   args.forEach((arg, i) => {
      //     if (typeof arg === 'function') {
      //       arg.bind(this)
      //       invokeInfo.callbacks[i] = arg
      //     }
      //   })
      //   context.next()
      //   return emitNextActions()
      // }
    }
  }
  return stubClass
}
