import { SpecPlugin } from '../spec'

export const arrayPlugin: SpecPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy: ({ getSpy }, subject) => {
    subject.forEach((s, i) => subject[i] = getSpy(s))
    return subject
  },
  createStub: (_, _meta) => {
    const stub: any[] = []
    return stub
  },
  metarize({ metarize }, spy) {
    return [...spy.map(metarize)]
  }
}
