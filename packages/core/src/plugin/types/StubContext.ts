import { Meta } from '../../spec';

export type StubContext = { player: StubPlayer }

export type StubPlayer = {
  /**
   * Declare a new spy.
   */
  declare(stub: any): StubSubjectPlayer
}

export type StubSubjectPlayer = {
  /**
   * Get a stub of the specified subject
   */
  getStub<T>(subject: T): T,
  construct(args: any[]): StubInstancePlayer,
  invoke(args: any[]): StubInvocationPlayer
} & StubInstancePlayer & StubInvocationPlayer

export type StubInstancePlayer = {
  get(name: string | number): StubAccessPlayer,
  set(name: string | number, value: any): StubAccessPlayer,
}

export type StubInvocationPlayer = {
  waitUntilReturn(handler: () => void): void,
} & StubAccessPlayer

export type StubAccessPlayer = {
  succeed(meta?: Meta): boolean,
  returns(): any,
  throws(): any
}
