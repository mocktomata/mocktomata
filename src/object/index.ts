import { Registrar } from 'komondor-plugin'

const TYPE = 'komondor/obj'

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    subject => typeof subject === 'object',
    (context, subject: any[], _action) => {
      return context.getSpy(subject)
    },
    // tslint:disable-next-line
    (_context, _subject, _action) => _subject
  )
}
