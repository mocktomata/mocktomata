export function isTypeOf(x: 'number' | 'boolean' | 'string') {
  return Object.assign(
    // tslint:disable-next-line:strict-type-predicates
    (a) => typeof a === x,
    {
      toString() {
        return `typeof ${x}`
      }
    })
}
