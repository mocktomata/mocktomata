export function isPromise(value: any) {
  return value && typeof value.then === 'function' && typeof value.catch === 'function'
}
