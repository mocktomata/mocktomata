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
  serialize: (subject) => JSON.stringify({ message: subject.message }),
  deserialize: (input) => new Error(JSON.parse(input).message)
}
