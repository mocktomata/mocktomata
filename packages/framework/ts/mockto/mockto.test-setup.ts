import type { Mockto, Spec } from '../index.js'

export function indirectMockto(
	mockto: Mockto.Fn,
	specName: string,
	options: Spec.Options,
	handler: Spec.Handler
) {
	return mockto(specName, options, handler)
}
