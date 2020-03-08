import { SpecPlugin } from '../spec-plugin'

export const inertPlugin: SpecPlugin<any> = {
  name: 'inert',
  support: () => false,
  createSpy: (_, v) => v,
  createStub: (_, v) => v
}
