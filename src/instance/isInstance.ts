export function isInstance(subject) {
  if (subject === undefined || subject === null) return false
  if (typeof subject !== 'object') return false

  // Encounter a case when using `axios` that it creates an object with no constructor.
  // Don't know how it does that but it happens
  // istanbul ignore next
  return subject.constructor && subject.constructor.name !== 'Object'
}
