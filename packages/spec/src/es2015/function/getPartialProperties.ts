export function getPartialProperties(subject: any) {
  const otherPropertyNames = Object.keys(subject)
  if (otherPropertyNames.length === 0) return undefined

  return otherPropertyNames.reduce((p, k) => {
    p[k] = subject[k]
    return p
  }, {} as any)
}
