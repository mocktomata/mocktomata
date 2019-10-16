export function isSpecable(subject: any) {
  const stype = typeof subject
  if (stype === 'string') return false
  if (subject === null) return false
  if (stype === 'object') return !Array.isArray(subject)
  if (stype !== 'function') return false
  return true
}
