import { SpecContext, SpecPluginUtil } from '../index'
import { createSatisfier } from 'satisfier';
import { spyClass } from './spyClass';

export function stubClass(context: SpecContext, util: SpecPluginUtil, subject, id: string) {
  function switchToSpy(currentAction, stubBag) {
    if (stubBag.spy) return stubBag.spy

    util.log.warn(`The current action '${currentAction}' does not match with saved record of ${id}. Spying instead.`)
    context.prune()
    stubBag.spy = new (spyClass(context, util, subject) as any)(...stubBag.ctorArgs)
    return stubBag.spy
  }

  function emitNextActions() {
    const action = context.peek()
    if (action && action.type === 'class/return') {
      return action.payload
    }
  }

  const stubClass = class extends subject {
    stubBag: any = { listeners: {} }
    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.stubBag.ctorArgs = args
      const action = context.peek()
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        switchToSpy('constructor', this.stubBag)
      }
      else {
        context.next()
        emitNextActions()
      }
    }
  }

  for (let p in stubClass.prototype) {
    stubClass.prototype[p] = function (...args) {
      const action = context.peek()
      if (!action || !createSatisfier(action.payload).test(JSON.parse(JSON.stringify(args)))) {
        const spy = switchToSpy(p, this.stubBag)
        return spy[p](...args)
      }
      else {
        context.next()
        return emitNextActions()
      }
    }
  }
  return stubClass
}
