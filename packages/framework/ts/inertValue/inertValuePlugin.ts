import { SpecPlugin } from '../spec-plugin'

// istanbul ignore next
export const inertPlugin: SpecPlugin<any> = {
  name: 'inert',
  support: () => false,
  createSpy: ({ setSpyOptions, setMeta }, v) => {
    setMeta(v)
    setSpyOptions(v, { inert: true })
    return v
  },
  createStub: (_, v, meta) => meta
}
