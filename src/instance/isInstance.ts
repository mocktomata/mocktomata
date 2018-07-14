export function isInstance(subject) {
  if (subject === undefined || subject === null) return false
  if (typeof subject !== 'object') return false
  if (!subject.constructor) return false

  return subject.constructor.name !== 'Object'
}
