
export function isClass(subject) {
  // made a reasonable tradeoff assuming there will be at least one method in the class.
  // after all, there will be nothing to spy/stub if there is no method.
  return typeof subject === 'function' &&
    subject.prototype &&
    // the prototype will always at least having 'constructor' in it, even for functions
    Object.getOwnPropertyNames(subject.prototype).length > 1
}
