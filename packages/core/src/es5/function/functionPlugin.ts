import { KomondorPlugin } from '../../plugin';
import { hasPropertyInPrototype } from '../hasPropertyInPrototype';
import { assignPropertiesIfNeeded, getPartialProperties } from './composeWithSubject';

export const functionPlugin: KomondorPlugin<Function> = {
  name: 'function',
  support: subject => {
    if (typeof subject !== 'function') return false

    if (hasPropertyInPrototype(subject)) return false

    return true
  },
  getSpy: (context, subject) => {
    const meta = {
      functionName: subject.name,
      properties: getPartialProperties(subject)
    }

    const spy = assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = recorder.invoke(args)
      try {
        const result = subject.apply(this, call.spiedArgs)
        return call.return(result)
      }
      catch (err) {
        throw call.throw(err)
      }
    }, meta.properties)
    const recorder = context.newSpyRecorder(spy, meta)
    return spy
  },
  getStub: (context, subject) => {
    const meta = {
      functionName: subject.name,
      properties: getPartialProperties(subject)
    }
    const stub = assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = recorder.invoke(args)
      if (call.succeed()) {
        return call.return()
      }
      else {
        throw call.throw()
      }
    }, meta.properties)
    const recorder = context.newStubRecorder(stub, meta)
    return stub
  },
  invoke(target, args) {
    target(...args)
  }
}
