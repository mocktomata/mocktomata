import { SpecPlugin } from '../spec';

export const stringPlugin: SpecPlugin<string> = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: ({ declare }, subject) => {
    declare(subject, { meta: subject })
    return subject
  },
  createStub: ({ declare }, subject) => {
    declare(subject)
    return subject
  },
  createImitator(_, meta) {
    return meta
  }
}
