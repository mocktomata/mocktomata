import { createSatisfier } from 'satisfier'

import { SpecContext, PluginUtil } from 'komondor-plugin'

import { SimulationMismatch } from '../errors'

export function stubClass(context: SpecContext, util: PluginUtil, subject) {
  function emitNextActions() {
    let action = context.peek()
    if (action && action.type === 'class/return') {
      let returnStub = util.getReturnStub(context, action)
      context.next()
      return returnStub || action.payload
    }
  }

  const stubClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondorStub: any = { methods: {} }
    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.__komondorStub.ctorArgs = args

      context.on('class/callback', action => {
        const invokeInfo = this.__komondorStub.methods[action.meta.name][action.meta.methodId]
        const callback = invokeInfo.callbacks[action.meta.callSite]
        callback(...action.payload)
        context.next()
      })

      const action = context.peek()
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        throw new SimulationMismatch(context.id, 'constructor', action)
      }
      else {
        context.next()
        emitNextActions()
      }
    }
  }

  for (let p in stubClass.prototype) {
    stubClass.prototype[p] = function (...args) {
      if (!this.__komondorStub.methods[p])
        this.__komondorStub.methods[p] = []
      const invokeInfo = { callbacks: {} }
      this.__komondorStub.methods[p].push(invokeInfo)

      const action = context.peek()
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        throw new SimulationMismatch(context.id, { type: 'class/invoke', payload: args, meta: { name: p } }, action)
      }
      else {
        args.forEach((arg, i) => {
          if (typeof arg === 'function') {
            arg.bind(this)
            invokeInfo.callbacks[i] = arg
          }
        })
        context.next()
        return emitNextActions()
      }
    }
  }
  return stubClass
}
