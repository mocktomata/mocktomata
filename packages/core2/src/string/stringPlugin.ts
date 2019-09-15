import { SpecPlugin } from '../spec';

export const stringPlugin: SpecPlugin<string> = {
  name: 'string',
  support: subject => typeof subject === 'string',
  createSpy: (_, subject) => {
    return subject
  },
  metarize(_, spy) {
    return spy
  },
  createStub: (_, meta) => {
    return meta
  },
  createImitator(_, meta) {
    return meta
  }
}
