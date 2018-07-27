// istanbul ignore next
// tslint:disable-next-line strict-type-predicates
export const isNode = typeof module !== 'undefined' && module['e' + 'xports'] && !module['webpackPolyfill']
