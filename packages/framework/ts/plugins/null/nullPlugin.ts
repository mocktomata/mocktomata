import type { SpecPlugin } from '../../spec-plugin/types.js'

export const nullPlugin: SpecPlugin<null> = {
  name: 'null',
  support: subject => subject === null,
  createSpy: () => null,
  createStub: () => null
}
