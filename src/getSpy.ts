import { unartifactify } from './artifactify';
import { isClass } from './class/isClass';

export function getSpy<T>(context, plugin, subject: T): T {
  const spy = plugin.getSpy(context, subject)
  const adjustedSpy = isClass(subject) ?
    function (...args) {
      return new spy(...unartifactify(args))
    } :
    function (...args) {
      return spy(...unartifactify(args))
    }

  const otherPropertyNames = Object.keys(subject)
  if (otherPropertyNames.length === 0) return adjustedSpy as any

  const others = otherPropertyNames.reduce((p, k) => {
    p[k] = subject[k]
    return p
  }, {})

  return Object.assign(adjustedSpy, others) as any
}
