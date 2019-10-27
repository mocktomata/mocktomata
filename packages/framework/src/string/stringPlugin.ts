import { SpecPlugin } from '../spec';

export const stringPlugin: SpecPlugin<string> = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: (_, subject) => {
    return subject
  },
  createStub: (_, _subject, meta) => {
    return meta
  },
  metarize(_, spy) {
    return spy
  },
}
