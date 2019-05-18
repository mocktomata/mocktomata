import { getPropertyNames } from './getPropertyNames';
import { StubContext } from '../../types';

export function stubClass(context: StubContext, subject: any) {
  const player = context.newPlayer({ className: subject.name })
  const stubClass = class extends subject {
    // tslint:disable-next-line:variable-name
    __komondorStub: any = {}
    constructor(...args: any[]) {
      // @ts-ignore
      super(...args)
      this.__komondorStub.instance = player.construct(args)
    }
  }
  getPropertyNames(stubClass).forEach(p => {
    stubClass.prototype[p] = function (...args: any[]) {
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
