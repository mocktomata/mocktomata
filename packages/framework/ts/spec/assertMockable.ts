import { NotSpecable } from './errors.js'
import { isSpecable } from './isSpecable.js'

export function assertMockable(subject: any) {
	if (!isSpecable(subject)) throw new NotSpecable(subject)
}
