import { SpecPlugin } from '../spec'

export const arrayPlugin: SpecPlugin<any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy: ({ id, getSpy }, subject) => {
    subject.forEach((s, i) => subject[i] = getSpy(id, s))
    return subject
  },
  createStub: (_, _meta) => {
    // console.log(meta)
    const stub: any[] = []
    return stub
  },
  metarize({ metarize }, spy) {
    return [...spy.map(metarize)]
  }
}
