import type { Spec } from './types.js'

export async function createMockSpec(): Promise<Spec> {
  return Object.assign(async (_: any, options: any) => options?.mock, {
    get mode() { return 'live' as const },
    async done() { return { refs: [], actions: [] } },
    enableLog: () => { },
    ignoreMismatch() { },
    maskValue() { },
  })
}
