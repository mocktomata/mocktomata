export function isSpecable(subject: any) {
	const st = typeof subject
	if (st === 'string') return false
	if (subject === null) return false
	if (st === 'object') return !Array.isArray(subject)
	if (st !== 'function') return false
	return true
}
