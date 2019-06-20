export function isSpecable(subject: any) {
  const stype = typeof subject
  if (stype === 'string') return false
  if (subject === null) return false
  if (stype === 'object' && Array.isArray(subject)) return false
  if (stype !== 'function') return false
  return true
}
