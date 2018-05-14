export function getPropertyNames(subject) {
  const properties = Object.getOwnPropertyNames(subject)
    .filter(p => p !== 'constructor')
  const proto = Object.getPrototypeOf(subject)
  if (proto === null) return []
  return properties.concat(getPropertyNames(proto))
}
