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
    const recorder = context.newRecorder(meta)

    return assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = recorder.invoke(args)
      try {
        const result = subject.apply(this, call.spiedArgs)
        return call.return(result)
      }
      catch (err) {
        throw call.throw(err)
      }
    }, meta.properties)
  },
  getStub: (context, subject) => {
    const meta = {
      functionName: subject.name,
      properties: getPartialProperties(subject)
    }
    const player = context.newPlayer(meta)
    return assignPropertiesIfNeeded(function (this: any, ...args: any[]) {
      const call = player.invoke(args)
      if (call.succeed())
        return call.result()
      else
        throw call.thrown()
    }, meta.properties)
  }
}
