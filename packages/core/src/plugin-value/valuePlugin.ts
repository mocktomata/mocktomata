import { KomondorPlugin } from '@komondor-lab/plugin'

export const valuePlugin: KomondorPlugin = {
  support: subject => {
    const type = typeof subject
    return type === 'boolean' ||
      type === 'number' ||
      type === 'string' ||
      type === 'undefined' ||
      subject === null
  },
  getSpy(_: any, subject: any) { return subject },
  getStub: (_: any, subject: any) => subject,
  serialize: subject => '' + subject
}
