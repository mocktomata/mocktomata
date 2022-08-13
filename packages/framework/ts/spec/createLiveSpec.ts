import { Spec } from './types'

export async function createLiveSpec(): Promise<Spec> {
  return Object.assign(async (subject: any) => subject, {
    get mode() { return 'live' as const },
    async done() { },
    enableLog: () => { },
    ignoreMismatch() { },
    maskValue() { },
  })
}
