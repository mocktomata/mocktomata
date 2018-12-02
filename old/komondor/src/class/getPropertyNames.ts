import { uniq } from 'ramda'

export function getPropertyNames(target, names: string[] = []): string[] {
  const proto = Object.getPrototypeOf(target)
  if (proto.prototype === undefined)
    return names
  return getPropertyNames(proto, uniq([
    ...names,
    ...Object.getOwnPropertyNames(proto.prototype).filter(x => x !== 'constructor')
  ]))
}
