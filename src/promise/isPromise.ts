export function isPromise(result) {
  return result && typeof result.then === 'function' && typeof result.catch === 'function'
}
