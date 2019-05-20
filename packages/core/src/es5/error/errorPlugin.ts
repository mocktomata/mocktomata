import { KomondorPlugin } from '../../plugin';

export const errorPlugin: KomondorPlugin = {
  name: 'error',
  support: subject => subject instanceof Error,
  getSpy: (_, subject) => subject,
  getStub: (_, subject) => subject,
  serialize: (subject) => JSON.stringify({ message: subject.message }),
  deserialize: (input) => new Error(JSON.parse(input).message)
}
