
export function isClass(subject) {
  return typeof subject === 'function' &&
    hasPropertyInPrototype(subject)
}

function hasPropertyInPrototype(subject) {
  let proto = subject.prototype
  while (proto !== undefined && proto !== Object.prototype) {
    // made a reasonable tradeoff assuming there will be at least one method in the class.
    // after all, there will be nothing to spy/stub if there is no method.
    if (Object.getOwnPropertyNames(proto).some(p => p !== 'constructor')) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
