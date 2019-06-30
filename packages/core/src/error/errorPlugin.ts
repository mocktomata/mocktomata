import { SpecPlugin } from '../spec';

export const errorPlugin: SpecPlugin = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    return subject
  },
  createStub: ({ player }, subject) => {
    player.declare().setTarget(subject)
    return subject
  },
  // TODO: serialize custom properties.
  createRepresentation: (_, subject) => ({ message: subject.message }),
  recreateSubject: (_, input) => new Error(input.message)
}
