import { RequiredPick } from 'type-plus';
import { SpecContext } from './context';
import { ActionPlayer } from './spec/ActionPlayer';
import { ActionRecorder } from './spec/ActionRecorder';
import { Meta } from './spec/types';

export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<T = any> {
  name?: string,
  support: (subject: any) => boolean,
  /**
   * @param context A context that gives the plugin all the tools needed to record what has happend to the subject.
   * @param subject The spying subject
   */
  getSpy(context: SpyContext, subject: T): T
  getStub(context: StubContext, subject: T): T
  /**
   * Serizlie the subject.
   * The result is used during simulation for comparison.
   */
  serialize?: (subject: T) => string | number | boolean | null
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void
}

export type PluginIO = {
  getPluginList(): Promise<string[]>
  loadPlugin(name: string): Promise<PluginModule>
}

export type PluginInstance = RequiredPick<KomondorPlugin, 'name'>

export type CaptureContext = SpecContext

/**
 * Spy Context gives the plugin all the tools needed to record what has happend to the subject.
 */
export type SpyContext = {
  newRecorder(meta?: Meta): ActionRecorder
  /**
   * @deprecated
   */
  newInstance(args?: any[], meta?: Meta): SpyInstance;
}

/**
 * Spy instance is
 */
export type SpyInstance = {
  /**
   * Create a new call context for recording the call.
   */
  newCall(meta?: Meta): SpyCall;
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

export type StubContext = {
  newPlayer(meta?: Meta): ActionPlayer;
}

export interface StubInstance {
  /**
   * Id of the stub instance.
   * For functions, each subject (different function) should have its own id.
   * For class, each instance (when instantiating a class) should have its own id.
   */
  instanceId: number;
  /**
   * Create a new call context for replaying the call.
   */
  newCall(meta?: Meta): StubCall;
}
export interface StubCall {
  invoked(args: any[], meta?: Meta): void;
  waitUntilReturn(callback: any): void;
  blockUntilReturn(): void;
  succeed(meta?: Meta): boolean;
  result(): any;
  thrown(): any;
}
