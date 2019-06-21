import { SpecPlugin } from '../spec';

export const errorPlugin: SpecPlugin = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    return subject
  },
  createStub: ({ player }, subject) => {
    player.declare(subject)
    return subject
  },
  // TODO: serialize custom properties.
  createRepresentation: ({ process }, subject) => ({ message: process(subject.message) }),
  recreateSubject: ({ process }, input) => new Error(process(input.message))
}
