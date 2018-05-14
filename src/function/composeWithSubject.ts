export function composeWithSubject(target, subject) {
  const properties = getPartialProperties(subject)
  return assignPropertiesIfNeeded(target, properties)
}

export function assignPropertiesIfNeeded(target, properties) {
  return properties ? Object.assign(target, properties) : target
}
export function getPartialProperties(subject) {
  if (subject === undefined || subject === null) return subject

  const otherPropertyNames = Object.keys(subject)
  if (otherPropertyNames.length === 0) return undefined

  return otherPropertyNames.reduce((p, k) => {
    p[k] = subject[k]
    return p
  }, {})
}
