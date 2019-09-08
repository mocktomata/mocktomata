import { SpecPlugin } from '../spec';

export const undefinedPlugin: SpecPlugin<string> = {
  name: 'undefined',
  support: subject => typeof subject === 'undefined',
  createSpy: ({ declare }, subject) => {
    declare(subject, { meta: subject })
    return subject
  },
  createStub: ({ declare }, meta) => {
    declare(meta)
    return meta
  },
  createImitator(_, meta) {
    return meta
  }
}
