import type { SpecPlugin } from '../../spec-plugin/types.js'

export const arrayPlugin: SpecPlugin<any[], any[]> = {
  name: 'array',
  support: Array.isArray,
  createSpy({ setMeta, getSpy, getSpyId, setProperty }, subject) {
    const spiedSubject = subject.map(getSpy)
    setMeta(spiedSubject.map(getSpyId))
    return new Proxy(spiedSubject, {
      set(target: any, property: any, value: any) {
        return setProperty({ key: property, value }, value => target[property] = value)
      }
    })
  },
  createStub({ resolve }, _, meta) {
    return meta.map(entry => resolve(entry))
  }
}
