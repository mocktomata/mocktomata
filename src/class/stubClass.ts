import { createSatisfier } from 'satisfier'
import { SpecContext, SpecPluginUtil } from '../index'

import { spyClass } from './spyClass'

export function stubClass(context: SpecContext, util: SpecPluginUtil, subject, id: string) {
  function switchToSpy(callSite, info) {
    if (info.spy) return info.spy

    if (context.peek())
      util.log.warn(`The current action '${callSite}' does not match with saved record of ${id}. Spying instead.`)
    else
      util.log.warn(`No record for '${callSite}'. Spying instead`)
    context.prune()
    info.spy = new (spyClass(context, util, subject) as any)(...info.ctorArgs)
    return info.spy
  }

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
        switchToSpy('constructor', this.__komondorStub)
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
        const spy = switchToSpy(p, this.__komondorStub)
        return spy[p](...args)
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
