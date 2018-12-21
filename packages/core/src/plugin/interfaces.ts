export interface PluginOptions {
  plugins?: string[]
}

export interface Plugin<T extends object = {}> {
  /**
   * Name of the plugin.
   * This is used to uniquely identify the plugin.
   */
  name: string,
  support: (subject: any) => boolean,
  getSpy: any,// getSpy<T>,
  getStub: any,// getStub<T>,
  serialize?: (subject: T) => string
}

// export type Meta = { [k: string]: any }

// export interface SpecAction {
//   type: string,
//   name: string,
//   payload: any,
//   meta?: Meta,
//   // komondor/callback action does not have instanceId
//   instanceId?: number,
//   invokeId?: number,
//   sourceType?: string,
//   sourceInstanceId?: number,
//   sourceInvokeId?: number,
//   sourceSite?: (string | number)[],
//   returnType?: string,
//   returnInstanceId?: number
// }

// export interface SpecActionWithSource extends SpecAction {
//   sourceType: string,
//   sourceInstanceId: number,
//   sourceInvokeId: number,
//   sourceSite: (string | number)[]
// }
// export interface SpecContext {
//   specId: string
// }

// export interface SpyContext extends SpecContext {
//   mode: SpecMode,
//   newInstance(args?: any[], meta?: Meta): SpyInstance
// }

// export interface SpyInstance {
//   /**
//    * Id of the spy instance.
//    * For functions, each subject (different function) should have its own id.
//    * For class, each instance (when instantiating a class) should have its own id.
//    */
//   instanceId: number,
//   /**
//    * Create a new call context for recording the call.
//    */
//   newCall(meta?: Meta): SpyCall
// }
// export interface SpyCall {
//   invokeId: number
//   /**
//    * Record that the call is being invoked
//    * @param args the args that the call is invoked with
//    */
//   invoke<T extends any[]>(args: T, meta?: Meta): T
//   /**
//    * Record that the call is returning
//    * @param result the return result
//    */
//   return<T>(result: T, meta?: Meta): T
//   /**
//    * Record that the call is throwing
//    * @param err the error to be thrown.
//    */
//   throw<T>(err: T, meta?: Meta): T
// }

// export interface StubContext extends SpecContext {
//   newInstance(args?: any[], meta?: Meta): StubInstance
// }

// export interface StubInstance {
//   /**
//    * Id of the stub instance.
//    * For functions, each subject (different function) should have its own id.
//    * For class, each instance (when instantiating a class) should have its own id.
//    */
//   instanceId: number,
//   /**
//    * Create a new call context for replaying the call.
//    */
//   newCall(meta?: Meta): StubCall
// }

// export interface StubCall {
//   invokeId: number,
//   invoked(args: any[], meta?: Meta): void
//   waitUntilReturn(callback: Function): void
//   blockUntilReturn(): void
//   onAny(callback: (action: SpecAction) => void): void
//   succeed(meta?: Meta): boolean
//   result(): any
//   thrown(): any
// }

// /**
//  * Mode of the spec.
//  * `live`: making live call and record actions to store.
//  * `save`: making live call and save recorded actions.
//  * `simulate`: replaying saved calls.
//  */
// export type SpecMode = 'live' | 'save' | 'simulate'

export type getSpy<T> = (context: /* SpyContext */ any, subject: T) => T
export type getStub<T> = (context: /* StbuContext */ any, subject: T, action?: /* SpecAction */ any) => T
