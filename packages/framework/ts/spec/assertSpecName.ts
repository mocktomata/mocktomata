import { SpecIDCannotBeEmpty } from './errors.js'

export function assertSpecName(specName: string) {
  if (specName === '') throw new SpecIDCannotBeEmpty()
}
