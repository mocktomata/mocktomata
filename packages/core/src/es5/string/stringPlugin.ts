import { KomondorPlugin } from '../../plugin';

export const stringPlugin: KomondorPlugin = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: (context, subject) => {
    context.newSpyRecorder(subject)
    return subject
  },
  createStub: (context, subject) => {
    context.newStubRecorder(subject)
    return subject
  },
  createReplayer(context, value) {
    return value
  },
  serialize(target) {
    return target
  }
}
