// import { Omit, pick } from 'type-plus';
// import { createTimeTracker } from './createTimeTracker';
// import { getPlugin } from './findPlugin';
// import { logRecordingTimeout } from './logs';
// import { addAction, addRef, findRef, findRefId, findTestDouble, getRef } from './mockRecordFns';
// import { ActionId, ReferenceId, SpecAction, SpecOptions, SpecReference } from './types';

// export type SpyRecord = ReturnType<typeof createSpyRecord>

// export function createSpyRecord(specId: string, options: SpecOptions) {
//   const time = createTimeTracker(options, () => logRecordingTimeout(options.timeout))
//   const refs: SpecReference[] = []
//   const actions: SpecAction[] = []
//   return {
//     specId,
//     addRef: (ref: SpecReference) => addRef(refs, ref),
//     getRef: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id),
//     findRef: (subjectOrTestDouble: any) => findRef(refs, subjectOrTestDouble),
//     findRefId: (subjectOrTestDouble: any) => findRefId(refs, subjectOrTestDouble),
//     getNextActionId: () => actions.length,
//     addAction: (action: Omit<SpecAction, 'tick' | 'instanceId'>) => addAction(actions, { ...action, tick: time.elaspe() }),
//     getAction: <A = SpecAction>(id: ActionId): A => actions[id]! as any as A,
//     getSubject: (id: ReferenceId | ActionId) => getRef({ refs, actions }, id)!.subject,
//     findTestDouble: <S>(subjectOrTestDouble: S) => findTestDouble(refs, subjectOrTestDouble),
//     getSpecRecord: () => ({
//       refs: refs.map(r => {
//         const plugin = getPlugin(r.plugin)
//         if (plugin.metarize) {
//           r.meta = plugin.metarize({ metarize: subject => findRefId(refs, subject) || subject }, r.testDouble)
//         }
//         return pick(r, 'plugin', 'mode', 'meta', 'source')
//       }),
//       actions
//     }),
//     end: () => { time.stop() },
//   }
// }
