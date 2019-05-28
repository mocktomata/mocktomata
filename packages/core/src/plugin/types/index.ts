import { KeyTypes } from 'type-plus';
import { ReplayerContext } from './Replayer';
import { SpyContext } from './Spy';
import { StubContext } from './Stub';

export * from './Replayer';
export * from './Spy';
export * from './Stub';

export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<S = any> {
  /**
   * Name of the plugin. This is needed only if there are multiple plugins in a package.
   */
  name?: string,
  support(subject: any): boolean,
  /**
   * @param context A context that gives the plugin all the tools needed to record what has happend to the subject.
   * @param subject The spying subject
   */
  createSpy(context: SpyContext, subject: S): S,
  createStub(context: StubContext, subject: S): S,
  createReplayer(context: ReplayerContext, value: string): S,
  /**
   * Serialize the subject.
   * This is used to deserialize the subject back during simulation.
   */
  serialize?: (subject: S, meta?: any) => string,
  /**
   * Deserialize the saved data into a fake subject.
   * This subject will be passed to the createStub() function to create a stub.
   */
  deserialize?: (input: string) => S,
  construct?: (target: S, args: any[]) => any,
  invoke?: (target: S, args: any[]) => any,
  get?: (target: S, prop: KeyTypes) => any,
}

export type PluginIO = {
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<PluginModule>,
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void,
}
