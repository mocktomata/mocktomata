import { SpecIDCannotBeEmpty } from './errors';

export function assertSpecName(specName: string) {
  if (specName === '') throw new SpecIDCannotBeEmpty()
}
