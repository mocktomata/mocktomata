import { SpecContext, SpecPluginUtil } from '../index'
import { createSatisfier } from 'satisfier';
import { spyClass } from './spyClass';
import { setImmediate } from 'timers';

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

  function emitNextActions(info) {
    let action = context.peek()
    if (action && action.type === 'class/return') {
      context.next()
      const next = context.peek()
      if (next && next.type === 'class/callback') {
        setImmediate(() => emitNextActions(info))
      }

      if (action.meta) {
        const returnStub = util.getReturnStub(context, action)
        if (returnStub)
          return returnStub
      }
      return action.payload
    }
    else {
      while (action && action.type === 'class/callback') {
        const invokeInfo = info.methods[action.meta.name][action.meta.id]
        const callback = invokeInfo.callbacks[action.meta.callSite]
        callback(...action.payload)
        context.next()
        action = context.peek()
      }
    }
  }

  const stubClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondorStub: any = { methods: {} }
    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.__komondorStub.ctorArgs = args
      const action = context.peek()
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        switchToSpy('constructor', this.__komondorStub)
      }
      else {
        context.next()
        emitNextActions(this.__komondorStub)
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
        context.next()
        args.forEach((arg, i) => {
          if (typeof arg === 'function') {
            arg.bind(this)
            invokeInfo.callbacks[i] = arg
          }
        })
        return emitNextActions(this.__komondorStub)
      }
    }
  }
  return stubClass
}
