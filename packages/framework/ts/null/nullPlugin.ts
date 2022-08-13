import { SpecPlugin } from '../spec-plugin/index.js'

export const nullPlugin: SpecPlugin<null> = {
  name: 'null',
  support: subject => subject === null,
  createSpy: () => null,
  createStub: () => null
}
