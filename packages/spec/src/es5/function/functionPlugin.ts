import { KomondorPlugin } from '../../types';
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

    const stub = assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = recorder.invoke(stub, args)
      try {
        const result = subject.apply(this, call.spiedArgs)
        return call.return(result)
      }
      catch (err) {
        throw call.throw(err)
      }
    }, meta.properties)
    const recorder = context.newRecorder(stub, meta)
    return stub
  },
  getStub: (context, subject) => {
    const meta = {
      functionName: subject.name,
      properties: getPartialProperties(subject)
    }
    const player = context.newPlayer(meta)
    return assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = player.invoke(args)
      if (player.isSpecSubject) {
        if (call.succeed()) {
          return call.result()
        }
        else {
          throw call.result()
        }
      }
      else {
        try {
          const result = subject.apply(this, call.stubbedArgs)
          return call.return(result)
        }
        catch (err) {
          throw call.throw(err)
        }
      }
    }, meta.properties)
  }
}
