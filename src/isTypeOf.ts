import { tersible } from 'tersify'

export function isTypeOf(x: 'number' | 'boolean' | 'string') {
  return tersible(
    // tslint:disable-next-line:strict-type-predicates
    (a) => typeof a === x,
    () => `typeof ${x}`)
}
