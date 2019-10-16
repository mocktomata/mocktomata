// import { SpecNotFound } from '@moctomata/io-fs';
// import { findPlugin, PluginInstance } from '@komondor-lab/plugin';
// import { NotSpecable } from '../errors';
// import { Spec } from '../interfaces';
// import { SpecAction } from '../specAction';
// import { SpecContext, SpecIO } from '../SpecContext';
// import { SpecOptions } from '../SpecOptions';
// import { ActionTracker } from './ActionSimulator';

// export async function createSimulateSpec<T>({ io }: SpecContext, id: string, subject: T, options?: SpecOptions): Promise<Spec<T>> {
//   const context = { data: { actions: [] as any } }

//   const plugin = findPlugin(subject)
//   if (!plugin) {
//     throw new NotSpecable(subject)
//   }

//   const actions = await loadActions({ io }, id)
//   // @ts-ignore
//   const actionTracker = new ActionTracker(id, actions)

//   return {
//     subject: createStub(context, plugin, subject),
//     done() {
//       return new Promise(a => {
//         a(io.writeSpec(id, context.data))
//       })
//     }
//   }
// }

// function createStub(context: any, plugin: PluginInstance, subject: any) {
//   return plugin.getStub(context, subject)
// }

// async function loadActions({ io }: { io: SpecIO }, specId: string) {
//   try {
//     const specRecord = await io.readSpec(specId)
//     return fixCircularRefs(specRecord.actions)
//   }
//   catch (err) {
//     throw new SpecNotFound(specId, err)
//   }
// }

// function fixCircularRefs(actions: SpecAction[]) {
//   const objRefs: object[] = []
//   return actions.map(action => {
//     return { ...action, payload: fixCirRefValue(action.payload, objRefs) }
//   })
// }

// function fixCirRefValue(value: any, objRefs: object[]): any {
//   if (Array.isArray(value)) {
//     return value.map(p => fixCirRefValue(p, objRefs))
//   }
//   if (value === undefined || value === null) return value

//   const type = typeof value
//   if (type === 'object') {
//     objRefs.push(value)
//     Object.keys(value).forEach(k => value[k] = fixCirRefValue(value[k], objRefs))
//     return value
//   }
//   if (typeof value !== 'string') return value

//   const matches = /\[circular:(\d+)\]/.exec(value)
//   if (matches) {
//     const cirId = parseInt(matches[1], 10)
//     return objRefs[cirId]
//   }
//   return value
// }
