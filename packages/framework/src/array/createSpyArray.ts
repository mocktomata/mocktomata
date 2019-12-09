import { SpecPlugin } from '../spec'

export function createSpyArray({ setMeta, getSpyId, setProperty }: SpecPlugin.SpyContext, subject: any[]) {
  setMeta(subject.map(item => getSpyId(item)))
  return new Proxy(subject, {
    set(target: any, property: any, value: any) {
      return setProperty({ key: property, value }, value => target[property] = value)
    }
  })
}
