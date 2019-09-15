import { IsoError } from 'iso-error'
import { SpecPlugin } from '../spec'

export const errorPlugin: SpecPlugin<Error, Record<string, any>> = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: (_, subject) => {
    // declare(subject, { meta: { message: subject.message } })
    return subject
  },
  createStub: (_, meta) => {
    return IsoError.fromSerializable(meta)
  },
  metarize: (_, spy) => {
    return IsoError.toSerializable(spy)
  },
  createImitator: (_, meta) => {
    const err = new Error(meta.message)
    return err
  },
}
