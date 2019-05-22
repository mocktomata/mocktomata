import { KomondorPlugin } from '../../plugin';

export const errorPlugin: KomondorPlugin = {
  name: 'error',
  support: subject => subject instanceof Error,
  getSpy: (context, subject) => {
    context.newSpyRecorder(subject)
    return subject
  },
  getStub: (context, subject) => {
    context.newStubRecorder(subject)
    return subject
  },
  serialize: (subject) => JSON.stringify({ message: subject.message }),
  deserialize: (input) => new Error(JSON.parse(input).message)
}
