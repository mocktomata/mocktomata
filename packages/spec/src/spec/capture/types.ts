import { SpecContext } from '../../context';
import { Meta } from '../types';

export type CaptureContext = SpecContext

export type SpyContext = {
  newSpy(meta?: Meta): Spy
}

export type Spy = {
  // /**
  //  * Id of the spy instance.
  //  * For functions, each subject (different function) should have its own id.
  //  * For class, each instance (when instantiating a class) should have its own id.
  //  */
  // instanceId: number;
  /**
   * Create a new call context for recording the call.
   */
  invoke(args: any[], meta?: Meta): SpyCall;
  instance(args: any[], meta?: Meta): SpyInstance;
  get(meta?: Meta): void
  set(value: any, meta?: Meta): void
}

export type SpyInstance = {
  invoke(args: any[], meta?: Meta): SpyCall;
}

export type SpyCall = {
  /**
   * Record that the call is being invoked
   * @param args the args that the call is invoked with
   */
  invoke<T extends any[]>(args: T, meta?: Meta): T;
  /**
   * Record that the call is returning
   * @param result the return result
   */
  return<T>(result: T, meta?: Meta): T;
  /**
   * Record that the call is throwing
   * @param err the error to be thrown.
   */
  throw<T>(err: T, meta?: Meta): T;
}

