import { SpecPlugin } from '../spec-plugin'

export const inertPlugin: SpecPlugin<any> = {
  name: 'inert',
  support: () => false,
  createSpy: ({ setSpyOptions }, v) => {
    setSpyOptions(v, { inert: true })
    return v
  },
  createStub: (_, v) => v
}
