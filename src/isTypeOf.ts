export function isTypeOf(x: 'number' | 'boolean' | 'string') {
  return Object.assign(
    // tslint:disable-next-line
    (a) => typeof a === x,
    {
      toString() {
        return `typeof ${x}`
      }
    })
}
