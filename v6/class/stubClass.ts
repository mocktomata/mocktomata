import { StubContext } from 'komondor-plugin'
import { getPropertyNames } from './getPropertyNames';

export function stubClass(context: StubContext, subject) {
  const stubClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondorStub: any = {}
    constructor(...args) {
      // @ts-ignore
      super(...args)
      this.__komondorStub.instance = context.newInstance(args, { className: subject.name })
    }
  }
  getPropertyNames(stubClass).forEach(p => {
    stubClass.prototype[p] = function (...args) {
      const instance = this.__komondorStub.instance
      const call = instance.newCall({ methodName: p })
      call.invoked(args)
      call.blockUntilReturn()
      if (call.succeed()) {
        return call.result()
      }

      throw call.thrown()
    }
  })
  return stubClass
}
