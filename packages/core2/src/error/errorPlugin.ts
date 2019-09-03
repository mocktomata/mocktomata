import { SpecPlugin } from '../spec';

export const errorPlugin: SpecPlugin<Error, { message: string }> = {
  name: 'error',
  support: subject => subject instanceof Error,
  createSpy: ({ declare }, subject) => {
    declare(subject, { meta: { message: subject.message } })
    return subject
  },
  createStub: ({ declare }, meta) => {
    const err = new Error(meta.message)
    declare(err)
    return err
  },
  createImitator: (_, meta) => {
    const err = new Error(meta.message)
    return err
  },
}
