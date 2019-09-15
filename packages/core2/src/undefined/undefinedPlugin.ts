import { SpecPlugin } from '../spec';

export const undefinedPlugin: SpecPlugin<string> = {
  name: 'undefined',
  support: subject => typeof subject === 'undefined',
  createSpy: (_, subject) => {
    // declare(subject, { meta: subject })
    return subject
  },
  createStub: (_, meta) => {
    return meta
  },
  createImitator(_, meta) {
    return meta
  }
}
