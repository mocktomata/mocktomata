import { SpecPlugin } from '../spec-plugin'

export const undefinedPlugin: SpecPlugin<string> = {
  name: 'undefined',
  support: subject => typeof subject === 'undefined',
  createSpy: (_, subject) => {
    // declare(subject, { meta: subject })
    return subject
  },
  createStub: (_, _subject, meta) => {
    return meta
  },
  createImitator(_, meta) {
    return meta
  }
}
