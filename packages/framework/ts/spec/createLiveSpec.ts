import type { Spec } from './types.js'

export async function createLiveSpec(): Promise<Spec> {
  return Object.assign(async (subject: any) => subject, {
    get mode() { return 'live' as const },
    async done() { return { refs: [], actions: [] } },
    enableLog: () => { },
    ignoreMismatch() { },
    maskValue() { },
  })
}
