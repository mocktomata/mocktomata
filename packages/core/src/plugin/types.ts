import { SpyContext, StubContext } from '../spec/types';

export type PluginActivationContext = {
  register(plugin: KomondorPlugin<any>): void
}

export interface KomondorPlugin<S = any> {
  name?: string,
  support: (subject: any) => boolean,
  /**
   * @param context A context that gives the plugin all the tools needed to record what has happend to the subject.
   * @param subject The spying subject
   */
  getSpy(context: SpyContext, subject: S): S,
  getStub(context: StubContext, subject: S): S,
  /**
   * Serizlie the subject.
   * The result is used during simulation for comparison.
   */
  serialize?: (subject: S) => any,
}

export type PluginModule = {
  activate: (activationContext: PluginActivationContext) => void,
}

export type PluginIO = {
  getPluginList(): Promise<string[]>,
  loadPlugin(name: string): Promise<PluginModule>,
}
