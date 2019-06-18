// import { tersify } from 'tersify';
// import { log } from '../util';
// import { SpecContext } from '../context';
// import { findPlugin } from '../plugin';
// import { PluginInstance } from '../plugin/typesInternal';
// import { getSpy } from './createRecorder';
// import { NotSpecable } from './errors';
// import { createSpecRecordValidator, SpecRecordValidator } from './SpecRecord';
// import { Meta, SpecOptions, SpecRecord } from './types';

// export async function createPlayer<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
//   if (typeof subject === 'string') throw new NotSpecable(subject)

//   const plugin = findPlugin(subject)
//   if (!plugin) throw new NotSpecable(subject)

//   const record: SpecRecord = { refs: [], actions: [] }
//   const actual = await context.io.readSpec(id)
//   const recordValidator = createSpecRecordValidator(id, actual, record)
//   const stubContext = createStubContext(recordValidator, plugin, subject)
//   const stub = plugin.createStub(stubContext, subject)

//   return {
//     stub,
//     async end() {
//       recordValidator.stop()
//       return
//     }
//   }
// }

// function createStubContext(recordValidator: SpecRecordValidator, plugin: PluginInstance, subject: any) {
//   return {
//     newStubRecorder(stub: any, meta?: Meta) {
//       const ref = recordValidator.getId(plugin.name, subject, stub)
//       return {
//         construct(args: any[] = []) {
//           const spiedArgs = args.map((arg, i) => getSpy(recordValidator, arg, { ref, site: [i] }))
//           recordValidator.construct(ref, spiedArgs)
//           recordValidator.processNextActions()

//           return {
//             spiedArgs
//           } as any
//         },
//         invoke(args: any[] = []) {
//           const spiedArgs = args.map(arg => getSpy(recordValidator, arg))
//           log.onDebug(log => log(`invoke:`, `"${ref}" with ${tersify(args)}`))
//           recordValidator.invoke(ref, spiedArgs)
//           recordValidator.processNextActions()
//           return {
//             succeed() {
//               return recordValidator.succeed()
//             },
//             return() {
//               // const spiedResult = getSpy(recordTracker, result)
//               // recordTracker.invokeReturn(ref, spiedResult)
//               recordValidator.scheduleProcessNextActions()
//               const result = recordValidator.invokeReturn()
//               return getSpy(recordValidator, result)
//             },
//             throw() {
//               recordValidator.scheduleProcessNextActions()
//               const err = recordValidator.invokeThrow()
//               return getSpy(recordValidator, err)
//             }
//           }
//         },
//         // todo: handle symbol, use KeyTypes
//         get(prop: string | number) {
//           recordValidator.get(ref, prop)
//           return {
//             return(result: any) {
//               const spiedResult = getSpy(recordValidator, result)
//               recordValidator.getReturn(ref, prop, spiedResult)
//               return spiedResult
//             },
//             throw(error: any) {
//               const spiedError = getSpy(recordValidator, error)
//               recordValidator.getThrow(ref, prop, spiedError)
//               return spiedError
//             }
//           }
//         },
//         // todo: handle symbol, use KeyTypes
//         set(prop: string | number, value: any) {
//           recordValidator.set(ref, prop, value)
//           return {
//             return(result: any) {
//               const spiedResult = getSpy(recordValidator, result)
//               recordValidator.setReturn(ref, prop, value, spiedResult)
//               return spiedResult
//             },
//             throw(error: any) {
//               const spiedError = getSpy(recordValidator, error)
//               recordValidator.setThrow(ref, prop, value, spiedError)
//               return spiedError
//             }
//           }
//         }
//       }
//     }
//   }
// }
