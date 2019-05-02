import { reduceKey } from 'type-plus';

export function assignPropertiesIfNeeded(target: any, properties: any) {
  return properties ? Object.assign(target, properties) : target
}
export function getPartialProperties(subject: any) {
  const otherPropertyNames = Object.keys(subject)
  if (otherPropertyNames.length === 0) return undefined

  return reduceKey(subject, (p, k) => {
    p[k] = subject[k]
    return p
  }, {} as any)
}
