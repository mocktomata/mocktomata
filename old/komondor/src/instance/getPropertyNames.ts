export function getPropertyNames(subject) {
  const properties = Object.getOwnPropertyNames(subject)
    .filter(p => p !== 'constructor')
  const proto = Object.getPrototypeOf(subject)
  if (proto === null) return []
  return properties.concat(getPropertyNames(proto))
}

export function getProperties(subject) {
  const propertyNames = getPropertyNames(subject)

  return propertyNames.reduce((p, name) => {
    p[name] = {
      descriptor: Object.getOwnPropertyDescriptor(subject, name),
      type: typeof subject[name]
    }
    return p
  }, {})
}
