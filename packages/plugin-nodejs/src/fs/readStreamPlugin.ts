import { SpecPlugin } from '@komondor-lab/core'
import fs from 'fs'

export const readStreamPlugin: SpecPlugin<fs.ReadStream> = {
  name: 'ReadStream',
  support: subject => subject instanceof fs.ReadStream,
  createSpy: (_, subject) => subject,
  createStub: (_, subject) => subject
}
