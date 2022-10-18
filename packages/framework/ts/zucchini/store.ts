import { AnyFunction } from 'type-plus'

export type Step = {
  clause: string,
  handler: AnyFunction,
  regex?: RegExp,
  valueTypes?: string[]
}

export function createStore() {
  return {
    store: {
      steps: [] as Step[]
    }
  }
}

export type Store = ReturnType<typeof createStore>['store']
