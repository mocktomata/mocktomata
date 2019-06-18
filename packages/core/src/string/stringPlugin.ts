import { KomondorPlugin } from '../plugin';

export const stringPlugin: KomondorPlugin = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: ({ recorder }, subject) => {
    recorder.declare(subject)
    return subject
  },
  createStub: ({ player }, subject) => {
    player.declare(subject)
    return subject
  }
}
