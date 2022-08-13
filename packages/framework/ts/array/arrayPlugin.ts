import { SpecPlugin } from '../spec-plugin/index.js'

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
  createStub({ resolve }, _, meta) {
    return meta.map(entry => resolve(entry))
  }
}
