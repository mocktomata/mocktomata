// import { SpecOptions, Spec } from './interfaces'
// import { log } from './log'
// import { spec } from './spec'
// import { store } from './store'

// // @ts-ignore
// function skipSetup(clause: string, listener?) {
//   return this
// }

// function run(cb: (spec: <T>(subject: T, options?: SpecOptions) => Promise<Spec<T>>) => Promise<any> | void) {
//   try {
//     return Promise.resolve(cb(spec))
//   }
//   catch (err) {
//     return Promise.reject(err)
//   }
// }

// export const scenario = Object.assign(
//   function scenario(_name: string) {
//     // const scenarioOptions = { name } as any

//     return {
//       setup(clause: string, listener?) {
//         if (listener) {
//           listener(spec)
//           return this
//         }

//         const setups = store.envHandlers.filter(g => {
//           if (typeof g.clause === 'string')
//             return g.clause === clause
//           else
//             return g.clause.test(clause)
//         })
//         if (setups.length === 0)
//           throw new Error(`Setup clause '${clause}' is not registered.`)

//         setups.forEach(g => g.listener())
//         return this
//       },
//       run
//     }
//   }, {
//     skip(name: string) {
//       return {
//         setup: skipSetup,
//         run: function skipRun(_cb: (spec: <T>(subject: T, options?: SpecOptions) => Promise<Spec<T>>) => Promise<any> | void) {
//           log.debug(`The scenario '${name}' is skipped.`)
//           return Promise.resolve()
//         }
//       }
//     },
//     skipSetup(_name: string) {
//       return {
//         setup: skipSetup,
//         run
//       }
//     }
//   })
