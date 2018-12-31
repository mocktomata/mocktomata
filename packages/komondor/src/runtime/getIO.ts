import { createLocalIO } from '@komondor-lab/io-local'

export const io = createLocalIO()

export function getIO() {
  return Promise.resolve(createLocalIO())
}
