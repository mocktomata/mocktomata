import type { Spec } from '@mocktomata/framework'
import type { AsyncContext } from 'async-fp'

export type WorkerStore = {
	context: AsyncContext<Spec.Context> | undefined
	overrideMode?: Spec.Mode
	filePathFilter?: RegExp
	specNameFilter?: RegExp
}
