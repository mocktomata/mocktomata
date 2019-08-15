import { Meta } from './Meta';

export interface SpecPlugin<S = any, M extends Record<string, any> = any> {
  /**
   * Name of the plugin. This is needed only if there are multiple plugins in a package.
   */
  name?: string,
  /**
   * Indicates if the plugin can handle the specified subject.
   */
  support(subject: any): boolean,
  /**
   * Creates a spy in place of the specified subject.
   * @param context Provides tools needed to record the subject's behavior.
   * @param subject The subject to spy.
   */
  createSpy(context: SpyContext, subject: S): S,
  /**
   * Creates a stub in place of the specified subject.
   * @param context Provides tools needed to reproduce the subject's behavior.
   * @param meta Meta data of the subject.
   * This is created in `createSpy() -> record.declare()` and is used to make the stub looks like the subject.
   */
  createStub(context: StubContext, meta: M | undefined): S,
}

export type SpyContext = {
  declare<S>(spy: S, meta?: Meta): SpyRecorder
  getSpy<S>(subject: S): S
}

export type StubContext = {
  declare<S>(stub: S, meta?: Meta): StubRecorder
}

export type SpyRecorder = {}
export type StubRecorder = {}
