import { uniq } from 'ramda'

export function getPropertyNames(target: any, names?: string[]): string[] {
  if (!names) {
    names = Object.keys(target)
  }
  const proto = Object.getPrototypeOf(target)
  if (proto.prototype === undefined)
    return names
  return getPropertyNames(proto, uniq([
    ...names,
    ...Object.getOwnPropertyNames(proto.prototype).filter(x => x !== 'constructor')
  ]))
}
