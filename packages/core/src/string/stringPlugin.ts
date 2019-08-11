import { SpecPlugin } from '../spec';

export const stringPlugin: SpecPlugin = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    return subject
  },
  createStub: ({ recorder: player }, subject) => {
    player.declare().setTarget(subject)
    return subject
  }
}
