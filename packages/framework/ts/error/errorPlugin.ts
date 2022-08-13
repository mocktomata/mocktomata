import { IsoError } from 'iso-error'
import { SpecPlugin } from '../spec-plugin/index.js'

export const errorPlugin: SpecPlugin<Error, Record<string, any>> = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: ({ setMeta }, subject) => {
    setMeta(IsoError.toSerializable(subject))
    return subject
  },
  createStub: (_context, _subject, meta) => {
    return IsoError.fromSerializable(meta)
  }
}
