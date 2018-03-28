import { Registrar } from 'komondor-plugin'

const TYPE = 'komondor/obj'

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    subject => typeof subject === 'object' && subject !== null,
    (context, subject: any[], _action) => {
      const result = {}
      Object.keys(subject).forEach(key => {
        const prop = subject[key]
        result[key] = context.getSpy(prop, key) || prop
      })
      return result
    },
    // tslint:disable-next-line
    (_context, _subject, _action) => {
      console.log('sub')
      return _subject
    }
  )
}
