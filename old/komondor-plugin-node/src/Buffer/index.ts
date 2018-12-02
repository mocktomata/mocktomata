import { Registrar } from 'komondor-plugin'

const TYPE = 'node/Buffer'

export function activate(registrar: Registrar) {
  registrar.register(
    TYPE,
    isBuffer,
    (context, subject) => subject,
    (context) => {},
    subject => subject
  )
}

export function isBuffer(subject) {
  return subject instanceof Buffer || (subject && subject.type === 'Buffer' && subject.data)
}
