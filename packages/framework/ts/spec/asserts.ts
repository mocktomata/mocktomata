import { NotSpecable, SpecIDCannotBeEmpty } from './errors.js'
import { isSpecable } from './spec_subject.js'

export function assertSpecName(specName: string) {
	if (specName === '') throw new SpecIDCannotBeEmpty()
}

export function assertMockable(subject: any) {
	if (!isSpecable(subject)) throw new NotSpecable(subject)
}
