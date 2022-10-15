import { IsoError } from 'iso-error'
import type { SpecPlugin } from '../../spec-plugin/types.js'

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
