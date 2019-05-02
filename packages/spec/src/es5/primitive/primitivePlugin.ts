import { KomondorPlugin } from '../../types';

export const primitivePlugin: KomondorPlugin = {
  name: 'primitive',
  support: subject => {
    const t = typeof subject
    return subject === null || t !== 'function' && t !== 'object'
  },
  getSpy: (_, subject) => subject,
  getStub: (_, subject) => subject
}
