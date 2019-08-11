import { SpyRecorder } from '../getSpy';
import { StubRecorder } from '../getStub';

export interface SpecPlugin<S = any, R = any> {
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
  createStub(context: StubContext, subject: S, representation: R): S,
  /**
   * Create a serializable representation of the subject.
   * The result will be stringified and stored.
   * This is used to construct the subject back during simulation.
   */
  createRepresentation?: (context: { process(subject: any): any }, subject: S, meta?: any) => S,
  /**
   * Reconstruct the subject from the saved data.
   * This subject will be passed to the createStub() function to create a stub.
   */
  recreateSubject?: (context: { process(input: any): any }, input: any) => S,
}

export type SpyContext = {
  recorder: SpyRecorder
}

export type StubContext = {
  recorder: StubRecorder
}
