import type { Spec } from './types.js'

export async function createMockSpec(): Promise<Spec> {
	return Object.assign(async (_: any, options: any) => options!.mock, {
		get mode() {
			return 'mock' as const
		},
		async done() {
			return { refs: [], actions: [] }
		},
		ignoreMismatch() {},
		maskValue() {}
	})
}
