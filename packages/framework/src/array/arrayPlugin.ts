import { SpecPlugin } from '../spec'

export const arrayPlugin: SpecPlugin<any[], any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy({ getSpy }, subject) {
    subject.forEach((s, i) => subject[i] = getSpy(s, { site: [i] }))
    return subject
  },
  createStub({ resolve }, _, meta) {
    return meta.map((x, i) => resolve(x, { site: [i] }))
  },
  metarize({ metarize }, spy) {
    return spy.map(metarize)
  }
}
