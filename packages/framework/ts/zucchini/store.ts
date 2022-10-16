
export type Step = {
  clause: string,
  handler: Function,
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
