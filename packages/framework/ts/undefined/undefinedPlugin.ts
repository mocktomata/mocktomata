import { SpecPlugin } from '../spec-plugin/index.js'

export const undefinedPlugin: SpecPlugin<string> = {
  name: 'undefined',
  support: subject => typeof subject === 'undefined',
  createSpy: (_, subject) => subject,
  createStub: (_, _subject, meta) => meta
}
