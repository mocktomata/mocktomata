import type { Expression } from '@cucumber/cucumber-expressions'
import type { AnyFunction } from 'type-plus'

export type Step = {
	expression: Expression
	handler: AnyFunction
}

export function createStore() {
	return {
		store: {
			steps: [] as Step[]
		}
	}
}

export type Store = ReturnType<typeof createStore>['store']
