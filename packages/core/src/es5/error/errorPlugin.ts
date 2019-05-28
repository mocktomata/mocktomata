import { KomondorPlugin } from '../../plugin';

export const errorPlugin: KomondorPlugin = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: (context, subject) => {
    context.newSpyRecorder(subject)
    return subject
  },
  createStub: (context, subject) => {
    context.newStubRecorder(subject)
    return subject
  },
  createReplayer(context, value) {
    return new Error(JSON.parse(value).message)
  },
  serialize: (subject) => JSON.stringify({ message: subject.message }),
  deserialize: (input) => new Error(JSON.parse(input).message)
}
