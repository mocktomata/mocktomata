import { SpecPlugin } from '../spec'

export const arrayPlugin: SpecPlugin<any[], any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy({ setMeta, getSpyId, setProperty }, subject) {
    setMeta(subject.map(item => getSpyId(item)))
    return new Proxy(subject, {
      set(target: any, property: any, value: any) {
        return setProperty({ key: property, value }, value => target[property] = value)
      }
    })
  },
  createStub({ resolve, setProperty }, _, meta) {
    const subject = meta.map(entry => resolve(entry))
    return new Proxy(subject, {
      set(target: any, property: string, value: any) {
        return target[property] = setProperty({ key: property, value })
      }
    })
  },
  metarize({ metarize }, spy) {
    return spy.map(metarize)
  }
}
