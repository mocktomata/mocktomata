import { isBaseObject } from './isBaseObject'

export function getPropertyNames(target: any): string[] {
  const names = Object.getOwnPropertyNames(target)
  const proto = Object.getPrototypeOf(target)
  return isBaseObject(proto) ? names : uniq(names, getPropertyNames(proto))
}

export function getInheritedPropertyNames(subjectClass: new () => any): string[] {
  return getInheritedPropertyNamesInternal(subjectClass, [])
}

function getInheritedPropertyNamesInternal(subjectClass: new () => any, names: string[]): string[] {
  const proto = Object.getPrototypeOf(subjectClass)
  return proto.prototype === undefined ? names : getInheritedPropertyNamesInternal(
    proto,
    uniq(names, Object.getOwnPropertyNames(proto.prototype))
  )
}

function uniq(a: string[], b: string[]) {
  return a.concat(b.filter(n => a.indexOf(n) === -1 && n !== 'constructor'))
}
