
export function isClass(subject) {
  // made a reasonable tradeoff assuming there will be at least one method in the class.
  // after all, there will be nothing to spy/stub if there is no method.
  return typeof subject === 'function' && subject.prototype && Object.keys(subject.prototype).length !== 0;
}
