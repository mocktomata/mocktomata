// import { pick } from 'type-plus';
// import { SpecContext } from '../context';
// import { findPlugin, getPlugin } from '../plugin';
// import { PluginInstance } from '../plugin/typesInternal';
// import { createTimeoutWarning } from './createTimeoutWarning';
// import { NotSpecable } from './errors';
// import { createSpecRecordTracker, SpecRecordTracker } from './SpecRecord';
// import { SpecOptions, SpecRecord } from './types';
// import { SpecRecordLive } from './typesInternal';

// export function createRecorder<T>(context: SpecContext, id: string, subject: T, options: SpecOptions) {
//   if (typeof subject === 'string') throw new NotSpecable(subject)

//   const plugin = findPlugin(subject)
//   if (!plugin) throw new NotSpecable(subject)

//   const record: SpecRecordLive = { refs: [], actions: [] }
//   const recordTracker = createSpecRecordTracker(record)

//   const spyContext = createSpyContext(recordTracker, plugin, subject, false)
//   const spy = plugin.createSpy(spyContext, subject)
//   const idleWarning = createTimeoutWarning(options.timeout)
//   return {
//     spy,
//     async end() {
//       idleWarning.stop()
//     },
//     async save() {
//       await this.end()
//       return context.io.writeSpec(id, makeSerializable(record))
//     }
//   }
// }

// function createSpyContext(recordTracker: SpecRecordTracker, plugin: PluginInstance, subject: any, serialize = true) {
//   return {
//     newSpyRecorder(spy: any, meta?: any) {
//       const ref = recordTracker.getId(plugin.name, subject, spy, serialize)
//       return {
//         meta,
//         construct(args: any[] = []) {
//           const spiedArgs = args.map((arg, i) => getSpy(recordTracker, arg, { ref, site: [i] }))
//           recordTracker.construct(ref, spiedArgs)

//           return {
//             spiedArgs
//           } as any
//         },
//         /**
//          * @param target The scope. This is usually the stub.
//          */
//         invoke(args: any[], meta?: any) {
//           const spiedArgs = args.map((arg, i) => getSpy(recordTracker, arg, { ref, site: [i] }))
//           recordTracker.invoke(ref, spiedArgs)

//           return {
//             meta,
//             spiedArgs,
//             return(result: any) {
//               const spiedResult = getSpy(recordTracker, result)
//               recordTracker.invokeReturn(ref, spiedResult)
//               return spiedResult
//             },
//             throw(error: any) {
//               const spiedError = getSpy(recordTracker, error)
//               recordTracker.invokeThrow(ref, spiedError)
//               return spiedError
//             }
//           }
//         },
//         // todo: handle symbol, use KeyTypes
//         get(prop: string | number) {
//           recordTracker.get(ref, prop)
//           return {
//             return(result: any) {
//               const spiedResult = getSpy(recordTracker, result)
//               recordTracker.getReturn(ref, prop, spiedResult)
//               return spiedResult
//             },
//             throw(error: any) {
//               const spiedError = getSpy(recordTracker, error)
//               recordTracker.getThrow(ref, prop, spiedError)
//               return spiedError
//             }
//           }
//         },
//         // todo: handle symbol, use KeyTypes
//         set(prop: string | number, value: any) {
//           recordTracker.set(ref, prop, value)
//           return {
//             return(result: any) {
//               const spiedResult = getSpy(recordTracker, result)
//               recordTracker.setReturn(ref, prop, value, spiedResult)
//               return spiedResult
//             },
//             throw(error: any) {
//               const spiedError = getSpy(recordTracker, error)
//               recordTracker.setThrow(ref, prop, value, spiedError)
//               return spiedError
//             }
//           }
//         }
//       }
//     }
//   }
// }

// export function getSpy<T>(recordTracker: SpecRecordTracker, subject: T, source?: any): T {
//   if (recordTracker.findId(subject)) return subject

//   const plugin = findPlugin(subject)
//   if (!plugin) return subject

//   const spyContext = createSpyContext(recordTracker, plugin, subject)
//   const spy = plugin.createSpy(spyContext, subject)

//   return spy
// }

// function makeSerializable(record: SpecRecordLive): SpecRecord {
//   return {
//     refs: record.refs.map(ref => {
//       const plugin = getPlugin(ref.plugin)!
//       if (plugin.serialize) {
//         return {
//           ...pick(ref, 'plugin', 'serialize'),
//           subject: plugin.serialize(ref.subject)
//         }
//       }
//       else {
//         return pick(ref, 'plugin', 'serialize', 'subject')
//       }
//     }),
//     actions: record.actions
//   }
// }
