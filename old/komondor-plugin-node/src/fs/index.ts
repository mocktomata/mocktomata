import { Registrar } from 'komondor-plugin'
import { ReadStream } from 'fs'

export function activate(registrar: Registrar) {
  registrar.register(
    'node/fs/ReadStream',
    subject => subject instanceof ReadStream,
    (context, subject) => subject,
    (context, subject) => subject
  )
}
