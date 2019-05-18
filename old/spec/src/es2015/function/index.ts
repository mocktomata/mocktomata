import { KomondorPlugin } from '../../types';

export const functionPlugin: KomondorPlugin = {
  name: 'function',
  support: subject => typeof subject === 'function',
  getSpy: (context, subject) => {
    const meta: any = {}
    if (subject.name) {
      meta.name = subject.name
    }

    const recorder = context.newRecorder(meta)

    return new Proxy(subject, {
      apply(target, thisArg, args) {
        const call = recorder.invoke(args)
        let result: any
        try {
          result = target.apply(thisArg, call.spiedArgs)
        }
        catch (err) {
          throw call.throw(err)
        }
        return call.return(result)
      }
    })
  },
  getStub: (context: any, subject: any) => subject
}


// export function stubFunction(context: StubContext, subject, action) {
//   const meta: any = {}
//   if (action && action.meta) {
//     meta.functionName = action.meta.functionName
//     meta.properties = action.meta.properties
//   }
//   else if (subject) {
//     if (subject.name) {
//       meta.functionName = subject.name
//     }
//     // const properties = getPartialProperties(subject)
//     // if (properties) {
//     //   meta.properties = properties
//     // }
//   }

//   // TODO: checking subject for not undefined for the time being.
//   // in new version it should be able to get the right subject.
//   const instance = context.newInstance(undefined, Object.keys(meta).length > 0 ? meta : undefined)

//   return assignPropertiesIfNeeded(function (...args) {
//     const call = instance.newCall()
//     call.invoked(args)
//     call.blockUntilReturn()
//     if (call.succeed())
//       return call.result()
//     else
//       throw call.thrown()
//   }, meta.properties)
// }
