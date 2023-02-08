import { Spec } from '@mocktomata/framework'
import { AsyncContext } from 'async-fp'

export type WorkerStore = {
	context: AsyncContext<Spec.Context> | undefined
	overrideMode?: Spec.Mode
	filePathFilter?: RegExp
	specNameFilter?: RegExp
}
