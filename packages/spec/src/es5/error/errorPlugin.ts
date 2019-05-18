import { KomondorPlugin } from '../../types';

export const errorPlugin: KomondorPlugin = {
  name: 'error',
  support: subject => {
    console.log('subj', subject)
    return subject instanceof Error
  },
  getSpy: (_, subject) => subject,
  getStub: (_, subject) => {

    return subject
  },
  serialize: (subject) => ({ message: subject.message, prototype: 'Error' })
}
