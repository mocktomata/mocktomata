"use strict";
// import { findSupportingPlugin } from '@komondor-lab/plugin';
// import { createSatisfier } from 'satisfier';
// import { tersify } from 'tersify';
// import { unpartial } from 'unpartial';
// import { logger } from '../../runtime';
// import { artifactKey } from '../constants';
// import { NotSpecable, SimulationMismatch } from '../errors';
// import { Meta } from '../interfaces';
// import { isMismatchAction, SpecAction, ReturnAction, InvokeAction, ConstructAction } from '../specAction';
// import { SourceNotFound } from './errors';
// import { StubContext } from './interfaces';
// export class ActionTracker {
//   waitings: { action: SpecAction, callback: Function }[] = []
//   events: { [type: string]: { [name: string]: ((action: SpecAction) => void)[] } } = {}
//   // listenAll: ((action) => void)[] = []
//   actualActions: SpecAction[] = []
//   stubs: { action: any, stub: any, subject: any }[] = []
//   constructor(public specId: string, public actions: SpecAction[]) { }
//   received(actual: SpecAction) {
//     const expected = this.peek()
//     if (actual.payload) {
//       // set expected payload to undefined for artifact,
//       // so that it is ignored during mismatch check
//       actual.payload.forEach((value: any, index: number) => {
//         if (value !== undefined && value !== null && value[artifactKey] && expected.payload[index])
//           expected.payload[index] = undefined
//       })
//     }
//     if (isMismatchAction(actual, expected)) {
//       throw new SimulationMismatch(this.specId, expected, actual)
//     }
//     logger.onDebug(() => `received: ${tersifyAction(actual)}`)
//     this.push(actual)
//     this.process(actual)
//   }
//   succeed(meta?: Meta) {
//     const expected = this.peek()
//     return expected && expected.name === 'return' && createSatisfier(meta).test(expected.meta)
//   }
//   result() {
//     const expected = this.peek()
//     this.push(expected)
//     logger.onDebug(() => `result: ${tersifyAction(expected)}`)
//     const result = this.getResultOf(expected)
//     setImmediate(() => this.process())
//     if (result && result.prototype === 'Error') {
//       const err: any = new Error(result.message)
//       Object.keys(result)
//         .filter(p => p !== 'prototype' && p !== 'message')
//         .forEach(p => err[p] = result[p])
//       return err
//     }
//     return result
//   }
//   waitUntil(action: SpecAction, callback: any) {
//     logger.onDebug(() => `waitUntil: ${tersifyAction(action)}`)
//     this.waitings.push({ action, callback })
//   }
//   private getResultOf(returnAction: ReturnAction) {
//     if (!returnAction.returnType) return returnAction.payload
//     let nextAction = this.peek()
//     // istanbul ignore next
//     if (!nextAction) throw new SimulationMismatch(this.specId, {
//       plugin: returnAction.returnType,
//       instanceId: returnAction.returnInstanceId
//     })
//     return this.getStub(nextAction)
//   }
//   private getStub(action: SpecAction, subject?: any) {
//     const plugin = findSupportingPlugin(action.plugin)
//     // istanbul ignore next
//     if (!plugin) throw new NotSpecable(action.plugin)
//     return plugin.getStub(createStubContext(this, plugin.name), subject, action)
//   }
//   private process(invokeAction?: InvokeAction | ConstructAction) {
//     let expected = this.peek()
//     if (!expected) {
//       if (invokeAction && invokeAction.name !== 'construct') {
//         throw new SimulationMismatch(this.specId,
//           {
//             plugin: invokeAction.plugin,
//             name: 'return',
//             instanceId: invokeAction.instanceId,
//             invokeId: invokeAction.invokeId
//           })
//       }
//       else {
//         return
//       }
//     }
//     logger.onDebug(() => `processing: ${tersifyAction(expected)}`)
//     if (this.waitings.length > 0) {
//       const cb = this.waitings.filter(c => !isMismatchAction(expected, c.action))
//       cb.forEach(c => {
//         this.waitings.splice(this.waitings.indexOf(c), 1)
//         c.callback(expected)
//       })
//     }
//     if (invokeAction && isReturnAction(invokeAction, expected)) {
//       logger.debug('wait for return action')
//       return
//     }
//     if (isActionWithSource(expected)) {
//       logger.onDebug(() => `create stub: ${tersifyAction(expected)}`)
//       const subject = this.getSourceSubject(expected)
//       // the stub will consume the `construct` action
//       const stub = this.getSourceStub(expected, subject)
//       this.stubs.push({ action: expected, stub, subject })
//       this.process()
//     }
//     if (expected.name === 'invoke') {
//       const entry = this.stubs.find(e =>
//         e.action.type === expected.type &&
//         e.action.instanceId === expected.instanceId
//       )
//       if (entry) {
//         logger.onDebug(() => `auto invoke: ${tersifyAction(expected)}`)
//         invokeSubjectAtSite(entry.stub, expected.meta, expected.payload)
//       }
//     }
//   }
//   private peek() {
//     return this.actions[this.actualActions.length]
//   }
//   private push(action: SpecAction) {
//     this.actualActions.push(action)
//   }
//   private getSourceSubject(action: SpecActionWithSource) {
//     const { sourceType, sourceInstanceId, sourceInvokeId, sourceSite } = action
//     const source = this.actualActions.find(a => a.type === sourceType && a.instanceId === sourceInstanceId && a.invokeId === sourceInvokeId)
//     // istanbul ignore next
//     if (!source) throw new SourceNotFound(action)
//     return sourceSite.reduce((p: any, v: any) => {
//       return p[v]
//     }, source.payload)
//   }
//   private getSourceStub(action: SpecActionWithSource, subject?: any) {
//     const plugin = findSupportingPlugin(action.type)
//     // istanbul ignore next
//     if (!plugin) throw new NotSpecable(action.type)
//     return plugin.getStub(createSourceStubContext(this, action, subject), subject, action)
//   }
// }
// function isReturnAction(action: SpecAction, nextAction: SpecAction) {
//   // may need to compare meta too.
//   return action.type === nextAction.type &&
//     nextAction.name === 'return' &&
//     action.instanceId === nextAction.instanceId &&
//     action.invokeId === nextAction.invokeId
// }
// function isActionWithSource(action: SpecAction): action is SpecActionWithSource {
//   return !!action.sourceType
// }
// export function createStubContext(actionTracker: ActionTracker, pluginType: string): StubContext {
//   return {
//     // specId: actionTracker.specId,
//     newInstance({ args, meta }: { args?: any[], meta?: Meta }) {
//       return createStubInstance(actionTracker, pluginType, args, meta)
//     }
//   }
// }
// function createStubInstance(actionTracker: ActionTracker, pluginName: string, args?: any[], meta?: Meta) {
//   const instanceId = actionTracker.actualActions.filter(a => a.plugin === pluginName && a.name === 'construct').length + 1
//   let invokeId = 0
//   actionTracker.received({
//     plugin: pluginType,
//     name: 'construct',
//     payload: args,
//     meta,
//     instanceId
//   })
//   return {
//     instanceId,
//     newCall(callMeta?: { [k: string]: any }) {
//       return createStubCall(actionTracker, pluginName, instanceId, ++invokeId, callMeta)
//     }
//   }
// }
// function createStubCall(actionTracker: ActionTracker, type: string, instanceId: number, invokeId: number, callMeta?: Meta) {
//   return {
//     invokeId,
//     invoked(args: any[], meta?: { [k: string]: any }) {
//       actionTracker.received({
//         type,
//         name: 'invoke',
//         payload: args,
//         meta: callMeta ? unpartial(callMeta, meta) : meta,
//         instanceId,
//         invokeId
//       })
//     },
//     waitUntilReturn(callback: any) {
//       const expected = {
//         type,
//         name: 'return',
//         payload: undefined,
//         instanceId,
//         invokeId
//       }
//       actionTracker.waitUntil(expected, callback)
//     },
//     succeed(meta?: { [k: string]: any }) {
//       return actionTracker.succeed(meta)
//     },
//     result() {
//       return actionTracker.result()
//     },
//     thrown() {
//       return actionTracker.result()
//     }
//   }
// }
// // istanbul ignore next
// function tersifyAction(action: any) {
//   return tersify(Object.keys(action).reduce<any>((p, k) => {
//     if (k === 'payload') {
//       p[k] = tersify(action[k])
//     }
//     else {
//       p[k] = action[k]
//     }
//     return p
//   }, {}), { maxLength: Infinity })
// }
// function createSourceStubContext(actionTracker: ActionTracker, action: SpecAction, subject: any): StubContext {
//   return {
//     // specId: actionTracker.specId,
//     newInstance({ args, meta }: { args?: any[], meta?: Meta }) {
//       return createSourceStubInstance(actionTracker, action, subject, args, meta)
//     }
//   }
// }
// function createSourceStubInstance(actionTracker: ActionTracker, action: SpecAction, subject: any, args?: any[], meta?: Meta) {
//   const instanceId = actionTracker.actualActions.filter(a => a.plugin === action.plugin && a.name === 'construct').length + 1
//   let invokeId = 0
//   actionTracker.received({
//     plugin: action.plugin,
//     name: 'construct',
//     payload: args,
//     meta,
//     instanceId,
//     // sourceType: action.sourceType,
//     // sourceInstanceId: action.sourceInstanceId,
//     // sourceInvokeId: action.sourceInvokeId,
//     // sourceSite: action.sourceSite
//   })
//   return {
//     instanceId,
//     newCall(callMeta?: { [k: string]: any }) {
//       return createSourceStubCall(actionTracker, action.plugin, subject, instanceId, ++invokeId, callMeta)
//     }
//   }
// }
// function createSourceStubCall(actionTracker: ActionTracker, type: string, subject: any, instanceId: number, invokeId: number, callMeta?: Meta) {
//   const stubCall = createStubCall(actionTracker, type, instanceId, invokeId, callMeta)
//   const invoked = stubCall.invoked
//   stubCall.invoked = (args: any[], meta?: { [k: string]: any }) => {
//     const mergedMeta = callMeta ? unpartial(callMeta, meta) : meta!
//     invoked(args, meta)
//     invokeSubjectAtSite(subject, mergedMeta, args)
//   }
//   return stubCall
// }
// // Ignore this at the moment because it needs to serialize/deserialize function in the action.payload (args).
// // istanbul ignore next
// function invokeSubjectAtSite(subject: any, meta: Meta | undefined, args: any[]) {
//   if (!meta || !meta.site) {
//     subject(...args)
//     return
//   }
//   let parent = subject
//   const fn = meta.site.reduce((p: any, v: any) => {
//     parent = p
//     return p[v]
//   }, subject)
//   fn.call(parent, ...args)
// }
//# sourceMappingURL=ActionSimulator.js.map