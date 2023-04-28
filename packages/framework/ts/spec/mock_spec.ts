import type { AsyncContext } from 'async-fp'
import { createAutoSpec } from './auto_spec.js'
import { createSpec } from './types.internal.js'
import type { Spec } from './types.js'

export async function createMockSpec(
	context: AsyncContext<createSpec.Context>,
	specName: string,
	specPath: string,
	options: Spec.Options
): Promise<Spec> {
	const spec = Object.assign(
		async function (subject: any, specOptions: any) {
			if (specOptions?.mock) {
				return specOptions.mock
			}
			const actualSpec = ((spec as any).actualSpec = await createAutoSpec(
				context,
				specName,
				specPath,
				options
			))
			return actualSpec(subject)
		},
		{
			get mode(): Spec.Mode {
				return 'mock'
			},
			async done() {
				return (spec as any).actualSpec?.done() ?? { refs: [], actions: [] }
			},
			ignoreMismatch(value: unknown) {
				;(spec as any).actualSpec?.ignoreMismatch(value)
			},
			maskValue(value: string, replaceWith?: string) {
				;(spec as any).actualSpec?.maskValue(value, replaceWith)
			}
		}
	)
	return spec
}
